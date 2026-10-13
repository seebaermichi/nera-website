import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import zlib from 'zlib'
import { getAssets, createZip, crc32, OUTPUT_PATH } from './index.js'

let tmp
let previousCwd

beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-zip-'))
    previousCwd = process.cwd()
    process.chdir(tmp)
})

afterEach(() => {
    process.chdir(previousCwd)
    fs.rmSync(tmp, { recursive: true, force: true })
})

function writeSkill(files) {
    const dir = path.join(tmp, 'node_modules', '@nera-static', 'nera', 'skills', 'nera')
    for (const [rel, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true })
        fs.writeFileSync(path.join(dir, rel), content)
    }
}

/** Reads a zip through its central directory: `{ name: content }`, checking each CRC. */
function readZip(buffer) {
    const end = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
    assert.ok(end >= 0, 'end of central directory present')
    const count = buffer.readUInt16LE(end + 10)
    let pos = buffer.readUInt32LE(end + 16)
    const entries = {}
    for (let i = 0; i < count; i++) {
        assert.equal(buffer.readUInt32LE(pos), 0x02014b50)
        const crc = buffer.readUInt32LE(pos + 16)
        const compressedSize = buffer.readUInt32LE(pos + 20)
        const nameLength = buffer.readUInt16LE(pos + 28)
        const localOffset = buffer.readUInt32LE(pos + 42)
        const name = buffer.toString('utf8', pos + 46, pos + 46 + nameLength)

        assert.equal(buffer.readUInt32LE(localOffset), 0x04034b50)
        const dataStart = localOffset + 30 + buffer.readUInt16LE(localOffset + 26)
        const data = zlib.inflateRawSync(buffer.subarray(dataStart, dataStart + compressedSize))
        assert.equal(crc32(data), crc, `CRC of ${name}`)
        entries[name] = data.toString('utf8')
        pos += 46 + nameLength
    }
    return entries
}

test('crc32 matches the standard check value', () => {
    assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926)
})

test('zips the installed skill under nera/, SKILL.md at the top', () => {
    writeSkill({
        'SKILL.md': '---\nname: nera\n---\n# Nera\n',
        'recipes/blog.md': '# Blog\n',
        'recipes/search.md': '# Search — ü\n',
    })

    const [asset] = getAssets()
    assert.equal(asset.to, OUTPUT_PATH)
    assert.ok(path.isAbsolute(asset.from))

    const entries = readZip(fs.readFileSync(asset.from))
    assert.deepEqual(Object.keys(entries), ['nera/SKILL.md', 'nera/recipes/blog.md', 'nera/recipes/search.md'])
    assert.equal(entries['nera/SKILL.md'], '---\nname: nera\n---\n# Nera\n')
    assert.equal(entries['nera/recipes/search.md'], '# Search — ü\n')
})

test('is deterministic: the same skill gives the same bytes', () => {
    writeSkill({ 'SKILL.md': '# Nera\n', 'recipes/a.md': 'a\n' })
    const first = fs.readFileSync(getAssets()[0].from)
    const second = fs.readFileSync(getAssets()[0].from)
    assert.ok(first.equals(second))
})

test('throws, failing the build, when the installed nera has no skill', () => {
    assert.throws(() => getAssets(), /no Nera skill .*>= 1\.10\.0/)
})

test('createZip of nothing is a valid empty archive', () => {
    assert.deepEqual(readZip(createZip([])), {})
})
