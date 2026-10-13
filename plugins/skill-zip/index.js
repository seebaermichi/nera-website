// Local plugin: publishes the Nera skill (an Agent Skill) as a zip for
// assistants that install skills by upload — claude.ai and Claude Desktop.
// The skill is not copied into this repo: it is read from the installed
// @nera-static/nera (`node_modules/@nera-static/nera/skills/nera`, shipped
// since 1.10.0), so the download always matches the CLI the site builds with
// and `npm update` is the only way to refresh it.
//
// The zip holds one folder, `nera/`, with `SKILL.md` at its top, the layout the
// upload expects. It is written by hand (deflate from zlib, a CRC-32 table) to
// stay free of dependencies, and it is deterministic: entries sorted, every
// timestamp 1980-01-01, so an unchanged skill gives a byte-identical file.
//
// Written to `.nera-cache/skill-zip/` and handed to core through `getAssets`
// (core >= 4.13.0): `public/` is deleted after the plugins run. A missing skill
// throws, failing the build, rather than publishing a page that links a 404.
//
// Kept synchronous on purpose — see the plugin contract in CLAUDE.md.
// Spec: ../nera-cli/ROADMAP-ai.md, slice 4 (L4).

import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

export const SKILL_NAME = 'nera'
export const OUTPUT_PATH = 'downloads/nera-skill.zip'
const CACHE_DIR = '.nera-cache/skill-zip'

/** The skill folder inside the site's installed @nera-static/nera. */
export function skillDir(cwd = process.cwd()) {
    return path.join(cwd, 'node_modules', '@nera-static', 'nera', 'skills', SKILL_NAME)
}

/** Every file below `dir`, as `/`-separated paths relative to it, sorted. */
function listFiles(dir, prefix = '') {
    return fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => (a.name < b.name ? -1 : 1)) // by code point, not locale
        .flatMap((entry) => {
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name
            if (entry.isDirectory()) return listFiles(path.join(dir, entry.name), rel)
            return entry.isFile() ? [rel] : []
        })
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c >>> 0
})

export function crc32(buffer) {
    let crc = 0xffffffff
    for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
}

// 1980-01-01 00:00 in MS-DOS format, the earliest a zip can hold.
const DOS_TIME = 0
const DOS_DATE = (0 << 9) | (1 << 5) | 1

/**
 * A zip archive (deflate, no extras, UTF-8 names) of `files`, each
 * `{ name, data }`, in the given order.
 */
export function createZip(files) {
    const locals = []
    const centrals = []
    let offset = 0

    for (const { name, data } of files) {
        const nameBuf = Buffer.from(name, 'utf8')
        const compressed = zlib.deflateRawSync(data, { level: 9 })
        const crc = crc32(data)

        const local = Buffer.alloc(30)
        local.writeUInt32LE(0x04034b50, 0)
        local.writeUInt16LE(20, 4) // version needed: 2.0 (deflate)
        local.writeUInt16LE(0x0800, 6) // flags: UTF-8 names
        local.writeUInt16LE(8, 8) // method: deflate
        local.writeUInt16LE(DOS_TIME, 10)
        local.writeUInt16LE(DOS_DATE, 12)
        local.writeUInt32LE(crc, 14)
        local.writeUInt32LE(compressed.length, 18)
        local.writeUInt32LE(data.length, 22)
        local.writeUInt16LE(nameBuf.length, 26)
        local.writeUInt16LE(0, 28)
        locals.push(local, nameBuf, compressed)

        const central = Buffer.alloc(46)
        central.writeUInt32LE(0x02014b50, 0)
        central.writeUInt16LE((3 << 8) | 20, 4) // made by: Unix, 2.0 (so the mode below counts)
        central.writeUInt16LE(20, 6) // version needed
        central.writeUInt16LE(0x0800, 8)
        central.writeUInt16LE(8, 10)
        central.writeUInt16LE(DOS_TIME, 12)
        central.writeUInt16LE(DOS_DATE, 14)
        central.writeUInt32LE(crc, 16)
        central.writeUInt32LE(compressed.length, 20)
        central.writeUInt32LE(data.length, 24)
        central.writeUInt16LE(nameBuf.length, 28)
        // extra, comment, disk, internal attributes: 0
        central.writeUInt32LE(0o100644 << 16 >>> 0, 38) // external: a regular file, rw-r--r--
        central.writeUInt32LE(offset, 42)
        centrals.push(central, nameBuf)

        offset += local.length + nameBuf.length + compressed.length
    }

    const centralSize = centrals.reduce((sum, buf) => sum + buf.length, 0)
    const end = Buffer.alloc(22)
    end.writeUInt32LE(0x06054b50, 0)
    end.writeUInt16LE(files.length, 8)
    end.writeUInt16LE(files.length, 10)
    end.writeUInt32LE(centralSize, 12)
    end.writeUInt32LE(offset, 16)

    return Buffer.concat([...locals, ...centrals, end])
}

/**
 * Zips the installed skill into the cache and hands it to core as
 * `public/downloads/nera-skill.zip`.
 */
export function getAssets() {
    const source = skillDir()
    if (!fs.existsSync(path.join(source, 'SKILL.md'))) {
        throw new Error(
            `skill-zip: no Nera skill at ${source}. It ships in @nera-static/nera ` +
                '>= 1.10.0; run `npm install`.'
        )
    }

    const files = listFiles(source).map((rel) => ({
        name: `${SKILL_NAME}/${rel}`,
        data: fs.readFileSync(path.join(source, rel)),
    }))

    const target = path.resolve(CACHE_DIR, path.basename(OUTPUT_PATH))
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, createZip(files))
    return [{ from: target, to: OUTPUT_PATH }]
}
