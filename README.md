The tile is designed to display key contacts for your group along with their roles and photos.

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

Select the members along with their roles and save.
View the configured data on Tile View.