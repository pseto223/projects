# Watcher tool

A little NodeJS tool I made for work. It watches files for changes and runs two Power Bash commands on change. 

The first command generates LESS source map (requires NodeJS LESS module), the second one runs custom script for reducing the size of .css files. 

The script is downloaded via npm and is activated in the desired folder via Command Prompt custom command.