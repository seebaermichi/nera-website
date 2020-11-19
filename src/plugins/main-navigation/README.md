# Main navigation - Nera plugin
This is a plugin for the static side generator [nera](https://github.com/seebaermichi/nera) to create the main navigation.  

__Note__
>For now it can only handle the root level of your pages.  

## Usage
At first you need to place this plugin in the `src/plugins` folder of your nera project.  

After this you should adjust the `src/plugins/main-navigation/config/main-navigation.yaml` file to your website. It includes already example settings. What ever property you will add to the elements, it will be available in the view file.  

Finally you need to include the `src/plugins/main-navigation/views/main-navigation.pug` where ever you want to have your main navigation. Be aware that there are already different types for the main navigation available. Just uncomment the version you need or prefer in the view file.
