#!/usr/bin/env node

"use strict"; 

const fs = require("fs");
const path = require("path"); 
const exec = require('child_process').exec;

console.log("\n" + "   Script running, waiting for changes in _skin.less and _variables.less"+"\n"); 

fs.watch('./', (eventType, filename) => 
{
    console.log(eventType + " " + filename); 
    if (eventType === "rename" && filename === "_skin.less" || eventType === "rename" && filename === "_variables.less")
    {
        let dirPath = path.resolve(filename).split("\\"); 
        let repBackslash = "";
        let repFrontslash = "";  

        //Creates a path for the app-mapped.css file one level outside the Mobile repo
        for (let i=0; i<dirPath.length-7; i+=1)
        {
            repBackslash = repBackslash + dirPath[i] +"\\"; 
        }

        //Excludes unnecessary path from the LESS source in the source maps
        for (let x=0; x<dirPath.length-1; x+=1)
        {  
            if (x !== parseInt(dirPath.length-3))
            {
                if (x !== parseInt(dirPath.length-4))
                {
                    repFrontslash = repFrontslash + dirPath[x] +"/";
                }
            }
        }

        //LESS mapping command with the source maps being inline
        let lessMap = `lessc app.less `+ repBackslash +`app-mapped.css --source-map-map-inline --source-map-rootpath=/css --source-map-basepath="`+repFrontslash+`"`; 
 
        //Auto compile app-mapped.css on change 
        let cssMapGenerate = exec(lessMap, (error) =>
        {
            if (error) 
            {
                console.log(`Error: ${error}`);
            }
            else
            {
                console.log("\n"+"  Mapped CSS file "+repBackslash+"app-mapped.css generated from skin "+dirPath[dirPath.length-3]+"\n"); 
            }
        });

        //Auto compile app.css minimize tool
        let runLessBuilder = exec("sb-resp-build-less", (error, result) =>
        {
            if (error) 
            {
                console.log(`Error: ${error}`);
            }
            else
            {
                console.log("Result:" + result)
            }
        });
    }
});