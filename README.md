Featured-Items-With-Images:

The tile is designed to share the information with images. You can add images as the background to the featured links/items to make the links more intuitive.

Tech Stack(primary) being used:

React Js
Jive-sdk
JQuery
Webpack
How to install and run:

clone the repo
run npm-install # installing required node packages
generate the uuid for the app using:
   var jive = require('jive-sdk');
   jive.util.guid()
   save the generated uuid into jiveclienconfiguration.json
   {
       "clientUrl": "http://localhost",
       "port": "8090",
       "development" : true,
       "extensionInfo" : {
           "uuid": "" # <- place the generated uuid here
       }
   }
run webpack command to compile the jsx files # this refers to webpack.config.js
run " jive-sdk build add-on --apphosting="jive" " # creation of extension.zip to be uploaded to jive.
How to use the tile:

Add links with the background image urls and save
View the configured data on Tile View.
