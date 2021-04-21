# Accelerating Scientific workflowS using EarthCube Technologies (ASSET): Sketching interface

Repository for the ASSET sketching web interface

The goal of this project is to create a sketching interface for scientists to quickly draft their thinking process in their day-to-day activities.

ASSET will allow you to: 

* Drag and drop types of activities
* Connect them together with arrows to indicate their order
* Assign which tools are used for different types of activities.
* Export your sketches/import previous sketches.

An overview of the tool can be seen below:

![alt text](https://github.com/KnowledgeCaptureAndDiscovery/ASSET/blob/master/documents/overview.png "ASSET Overview")


## Demo

A live demo of the project is available at: https://w3id.org/asset-tool (redirects to https://asset.isi.edu/)

At the moment, the demo will only work on **Google Chrome**

## Tutorial:

See the following link https://asset-6b864.firebaseapp.com/tutorial.html for a simple tutorial of the tool.

## Customize ASSET Tasks
If you want to add your own set(s) of tasks to replace or add onto the current sets of tasks, including common tasks, data science tools, common tools, and earthcube tools, please follow the instructions below.

1. If you have git installed on your computer, ```git clone``` the repository. Otherwise, click on the green button on the top right corner that says code and click on Download ZIP.
2. On your computer, ```cd``` into the ASSET folder that you just cloned or downloaded in step 1, then ```cd``` into the development folder in your terminal. Follow the [instructions](https://github.com/KnowledgeCaptureAndDiscovery/ASSET/tree/master/development) here to set up all of the dependencies needed to run this project. 
3. Inside the development folder, create a new folder and add all relevant images of different tasks inside this folder. 
4. Open *content.json*. To make a new set of tasks such as Common Tasks, select and copy everything from line 4 to line 177 (the set of {} outside of ```"name": "Common Tasks", "elements":```). Then, add , on line 557 after the } and paste the JSON to line 558, removing the , at the end.
5. To name the set of multiple tasks, change the ```"name": "Common Task"``` into another name. 
6. To name each individual task, change the ```"elementName": "Query Database"``` into another name.
7. To update the icon of an individual task, change the path of the icon in ```"imageSource": "/images/commonTasks/queryDatabase.png"``` to the folder name and image name that you created in step 3.
8. Make sure you save all of your changes in *content.json* and you are in the development folder in your terminal. Then, type in ```polymer serve``` and copy paste this URL (http://127.0.0.1:8081) into your browser to see all of the new tasks that you just added. 
