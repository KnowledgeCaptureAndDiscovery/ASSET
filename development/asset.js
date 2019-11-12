var exportAnchorElement;
var assetAppElement;
var popupElement;
var popupContainerElement;
var canvasElement;
var ctx;
var editArray;
var edge;
var mouseOverElement;
var selectedElement;
var selectedSubElement;
var descriptionElement;
var descriptionTable;
var detailTemplate;
var title;

var globalJSON = {"mainObjects": [], "edges": [], "details": [], "subcomponent_details": [], "title" : ""}; // the workflow elements and edges and details and title

var saved; //stores the boolean in which the workflow was exported or not

var undoArray = [];
var redoArray = [];
var undoButton;
var redoButton;

//Helpers for the canvas zoom functions
var slider;
var currentScale;
var minScale;
var maxScale;
var sketchCache;
var step;
var zoomInButton;
var zoomOutButton;

/*
	 Called when body is initialized

	 TO DO: FIX ZOOM
*/
function initialize() {

	localStorage.setItem("globalJSON", JSON.stringify(globalJSON)); //maps tuple of two lists (main Objects and edges)

	assetAppElement = Polymer.dom(this.root).querySelector("asset-app"); //adds asset-app as a field

	//adds popup element as field
	popupElement = Polymer.dom(assetAppElement.root).querySelector("#popup");
	popupContainerElement = Polymer.dom(assetAppElement.root).querySelector("#popupContainer");

	canvasElement = Polymer.dom(assetAppElement.root).querySelector("#workflowSketchCanvas"); // the canvas added

	mouseOverElement = null;
	selectedElement = null; // element that is currently selected
	currentElement = null;

	edge = null;

	descriptionElement = Polymer.dom(assetAppElement.root).querySelector("#descriptionSection"); //description section added
	descriptionTable = Polymer.dom(assetAppElement.root).querySelector("#table");
	detailTemplate = [
			{name: 'Name', detail: ''},
			{name: 'Description', detail: ''},
			{name: 'Author', detail: ''},
			{name: 'Duration', detail: ''},
			{name: 'Tools used', detail: ''}
		];

	//canvas container: adds the canvas so it doesnt expand and stuff
    var canvasholder = Polymer.dom(assetAppElement.root).querySelector("#canvasContainerSection");
    canvasElement.width = canvasholder.offsetWidth-3;
	canvasElement.height = canvasholder.offsetHeight-2;
	var rect= canvasElement.getBoundingClientRect();

	zoomInButton = Polymer.dom(assetAppElement.root).querySelector("#zoomIn");
	zoomInButton.style.top = "calc(" + (rect.bottom - zoomInButton.offsetHeight * 2) + "px - .6em)";
	zoomInButton.style.left = rect.left + "px";
	zoomInButton.style.visibility = "visible";
	zoomOutButton = Polymer.dom(assetAppElement.root).querySelector("#zoomOut");
	zoomOutButton.style.top = "calc(" + (rect.bottom - zoomOutButton.offsetHeight) + "px - .3em)";
	zoomOutButton.style.left = rect.left + "px";
	zoomOutButton.style.visibility = "visible";

	undoButton = Polymer.dom(assetAppElement.root).querySelector("#undoButton");
	undoButton.style.top = rect.top + "px";
	undoButton.style.left = rect.left + "px";
	undoButton.style.visibility = "visible";
	redoButton = Polymer.dom(assetAppElement.root).querySelector("#redoButton");
	redoButton.style.top = rect.top + "px";
	redoButton.style.left = "calc(" + (rect.left + redoButton.offsetWidth) + "px + .3em)";
	redoButton.style.visibility = "visible";

	//this is zoom stuff just saving all the properties of the slider so we dont have to keep accessing it
	slider = Polymer.dom(assetAppElement.root).querySelector("#sizeSlider");
	minScale = slider.min;
	maxScale = slider.max;
	step = slider.step;

	title = Polymer.dom(assetAppElement.root).querySelector("#title");
	globalJSON["title"] = title.innerHTML; //saves the title

	exportAnchorElement = Polymer.dom(assetAppElement.root).querySelector("#exportAnchor"); //adds export button as a field
	exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON"))); // returns the workflow file and the globalJSON
	exportAnchorElement.download = globalJSON["title"] + ".json"; //sets download name to title

	//for saving and warnings
	saved = true;
	window.onbeforeunload = function() {
		if (!saved){
			return "Data will be lost if you leave the page, are you sure?";
		}
	};

	Polymer.dom(assetAppElement.root).querySelector("#populateDetailsSection").innerHTML = "";

	//helpers for delete press
	canvasElement.tabIndex = 1000;
	canvasElement.style.outline = "none";

	//sets the canvas font and alignment
	ctx = canvasElement.getContext('2d');
	ctx.font = "20px Arial";
	ctx.textAlign = "center";

	currentScale = slider.immediateValue;

	window.onresize = function() {
		canvasElement.width = canvasholder.offsetWidth-3;
		canvasElement.height = canvasholder.offsetHeight-2;
		ctx.textAlign = "center";
		ctx.font = "20px Arial";
		currentScale = slider.immediateValue;

		var rect= canvasElement.getBoundingClientRect();
		zoomInButton.style.top = "calc(" + (rect.bottom - zoomInButton.offsetHeight * 2) + "px - .6em)";
		zoomInButton.style.left = rect.left + "px";
		zoomOutButton.style.top = "calc(" + (rect.bottom - zoomOutButton.offsetHeight) + "px - .3em)";
		zoomOutButton.style.left = rect.left + "px";
		undoButton.style.top = rect.top + "px";
		undoButton.style.left = rect.left + "px";
		redoButton.style.top = rect.top + "px";
		redoButton.style.left = "calc(" + (rect.left + redoButton.offsetWidth) + "px + .3em)";
	};

	zoomInButton.style.cursor = "zoom-in";
	zoomOutButton.style.cursor = "zoom-out";

	//Fetch the source JSON Asynchronously	
	var requestObject;
	requestObject = new XMLHttpRequest();
	requestObject.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			localStorage.setItem("sourceJSON", this.responseText);

			var workflowElementsString = "<workflow-elements draggable='false' id='elementsSelect' src='content.json'></workflow-elements>";

			var populateWorkflowElementsElement = Polymer.dom(assetAppElement.root).querySelector("#WorkFlowElementsSection");
			populateWorkflowElementsElement.innerHTML = workflowElementsString;

			//to load the images
			//eventFire((Polymer.dom((Polymer.dom(assetAppElement.root).querySelector("#elementsSelect")).root).querySelector("[id='Common Tasks']")), 'click');
			//eventFire((Polymer.dom((Polymer.dom(assetAppElement.root).querySelector("#elementsSelect")).root).querySelector("[id='EarthCube Tools']")), 'click');
			//eventFire((Polymer.dom((Polymer.dom(assetAppElement.root).querySelector("#elementsSelect")).root).querySelector("[id='Common Tools']")), 'click');
		}
	};
	requestObject.open("GET", "content.json", true);
	requestObject.send();
	
}

function dropdown() {
    Polymer.dom(assetAppElement.root).querySelector("#myDropdown").classList.toggle("show");
}

function loadExampleWorkflow(fileNum) {
	Polymer.dom(assetAppElement.root).querySelector("#myDropdown").classList.toggle("show");
	if (saved == false && !confirm("Your work may be deleted. Continue?")) {
		return;
	}
	
	if (fileNum == 0) {
		globalJSON = JSON.parse(algal);
		globalJSON = updateJSONWithID(globalJSON);
		localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
		exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

		Polymer.dom(assetAppElement.root).querySelector("#title").innerHTML = globalJSON["title"]; //title change
		exportAnchorElement.download = globalJSON["title"] + ".json"; //download name set to the new one
		drawToCanvas(globalJSON);
		selected = false;
	} else if (fileNum == 1) {
		globalJSON = JSON.parse(lgm);
		globalJSON = updateJSONWithID(globalJSON);
		localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
		exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

		Polymer.dom(assetAppElement.root).querySelector("#title").innerHTML = globalJSON["title"]; //title change
		exportAnchorElement.download = globalJSON["title"] + ".json"; //download name set to the new one
		drawToCanvas(globalJSON);
		selected = false;
	} else if (fileNum == 2) {
		globalJSON = JSON.parse(qgis);
		globalJSON = updateJSONWithID(globalJSON);
		localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
		exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

		Polymer.dom(assetAppElement.root).querySelector("#title").innerHTML = globalJSON["title"]; //title change
		exportAnchorElement.download = globalJSON["title"] + ".json"; //download name set to the new one
		drawToCanvas(globalJSON);
		selected = false;
	}
}

/*
	Changes the workflow based off the event in the undo array

	eventNumber: it is an integer and is interpreted as an event that has happened
	param: an array that has the necessary values to undo

	The following is formated as:
		eventNumberValue : descriptionOfEvent (theArrayOfParams)

		0 : object created ()
		1 : object deleted (element object, element details, element edges)
		2 : object moved (id, previous position)
		3 : edge created ()
		4 : edge deleted (edgeArray)
		5 : Workflow title changed (previous title)
		*removed* 6 : description table: title changed (id, index, previous value)
		*removed* 7 : description table: details changed (id, index, previous value)
		*removed* 8 : property added (id)
		9: tool added (id, previousObject)
		10 : subcomponent deleted ( tools used and element details )

	"id" is element's id btw
*/
function undo() {

	if( undoArray.length == 0 ) {
		console.log("No option for undo");
		return;
	}

	selectedElement = null;
	selectedEdge = null;
	resetTable();
	var eventNumber = undoArray[undoArray.length -1][0];
	var param = undoArray[undoArray.length -1][1];
	if (eventNumber == "0") { //delete element
		redoArray.push([0, [globalJSON.mainObjects.splice(globalJSON.mainObjects.length-1, 1)[0], globalJSON.details.splice(globalJSON.details.length-1, 1)[0], globalJSON.subcomponent_details.splice(globalJSON.subcomponent_details.length-1, 1)[0]]]);
	} else if (eventNumber == "1") { //add element
		globalJSON.mainObjects.push(param[0]);
		for (var i = 3; i < param.length; i++) {
			globalJSON.edges.push(param[i]);
		}
		globalJSON.details.push(param[1]);
		globalJSON.subcomponent_details.push(param[2]);
		redoArray.push([1,param[0]]);
	} else if (eventNumber == "2") {
		for (var i = 0; i < globalJSON.mainObjects.length; i++) {
			if (param.id == globalJSON.mainObjects[i].id) {
				redoArray.push([2, JSON.parse(JSON.stringify(globalJSON.mainObjects[i]))]);
				globalJSON.mainObjects[i] = param;
			}
		}
	} else if (eventNumber == "3") { // delete the edge
		redoArray.push([3,globalJSON.edges.pop()]);
	} else if (eventNumber == "4") { // create the edge
		globalJSON.edges.push(param);
		redoArray.push([4,null]);
	} else if (eventNumber == "5") {
		//redoArray = "param"
		//globalJSON.title = param;
		//title.innerHTML = param;
	} else if (eventNumber == "6") {
		// for (var i = 0; i < globalJSON.mainObjects.length; i++) {
		// 	if (param[0] == globalJSON.mainObjects[i].id) {
		// 		globalJSON.details[i][param[1]]["name"] = param[2];
		// 	}
		// }
	} else if (eventNumber == "7") {

	} else if (eventNumber == "8") {

	} else if (eventNumber == "9") {
		redoArray.push([9, [param[0], JSON.parse(JSON.stringify(globalJSON.mainObjects[param[0]])), JSON.parse(JSON.stringify(globalJSON.subcomponent_details[param[0]]))]]);
		globalJSON.mainObjects[param[0]] = param[1];
		globalJSON.subcomponent_details[param[0]] = param[2];
	} else if (eventNumber == "10") {		
		redoArray.push([10, [param[0], param[3]]]);
		globalJSON.mainObjects[param[0]].toolsUsed.splice(param[3], 0, param[1]);
		globalJSON.subcomponent_details[param[0]].details.splice(param[3], 0, param[2]);
	}
	undoArray.pop();
	drawToCanvas(globalJSON);
	localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
		exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
}
/*
	See undo function

	The following is formated as:
		eventNumberValue : descriptionOfEvent (theArrayOfParams)

		0 : object created (element object, element details)
		1 : object deleted (element)
		2 : object moved (id, previous position)
		3 : edge created (edgeArray)
		4 : edge deleted (edgeArray)
		5 : Workflow title changed (previous title)
		*removed* 6 : description table: title changed (id, index, previous value)
		*removed* 7 : description table: details changed (id, index, previous value)
		*removed* 8 : property added (id)
*/
function redo() {
	
	if( redoArray.length == 0 ) {
		console.log("No option for redo");
		return;
	}

	selectedElement = null;
	selectedEdge = null;
	resetTable();
	var eventNumber = redoArray[redoArray.length -1][0];
	var param = redoArray[redoArray.length -1][1];
	if (eventNumber == "0") { //recreate an element
		globalJSON.mainObjects.push(param[0]);
		globalJSON.details.push(param[1]);
		globalJSON.subcomponent_details.push(param[1]);
		undoArray.push([0, null]);
	} else if (eventNumber == "1") {
		var undoElement= [];
		for( var i = 0; i < globalJSON.mainObjects.length; i++ ) {

			if( globalJSON.mainObjects[i].id == param.id ) {

				undoElement.push(globalJSON.mainObjects.splice(i, 1)[0]);
                undoElement.push(globalJSON.details.splice(i,1)[0]);
				undoElement.push(globalJSON.subcomponent_details.splice(i,1)[0]);
				break;
			}
		}

		for (var j = 0; j < globalJSON.edges.length; j++) {
			if( globalJSON.edges[j][0] == param.id || globalJSON.edges[j][1] == param.id ) {
				undoElement.push(globalJSON.edges.splice(j, 1)[0]);
				j--;
			}
        }
		undoArray.push([1, undoElement]);
	} else if (eventNumber == "2") {
		for (var i = 0; i < globalJSON.mainObjects.length; i++) {
			if (param.id == globalJSON.mainObjects[i].id) {
				undoArray.push([2, JSON.parse(JSON.stringify(globalJSON.mainObjects[i]))]);
				globalJSON.mainObjects[i] = param;
			}
		}
	} else if (eventNumber == "3") {
		globalJSON.edges.push(param);
		undoArray.push([3,null]);
	} else if (eventNumber == "4") {
		undoArray.push([4,globalJSON.edges.pop()]);
	} else if (eventNumber == "5") {
	} else if (eventNumber == "6") {
	} else if (eventNumber == "7") {
	} else if (eventNumber == "8") {
	} else if (eventNumber == "9") {
		undoArray.push([9, [param[0], JSON.parse(JSON.stringify(globalJSON.mainObjects[param[0]])), JSON.parse(JSON.stringify(globalJSON.subcomponent_details[param[0]]))]]);
		globalJSON.mainObjects[param[0]] = param[1];
		globalJSON.subcomponent_details[param[0]] = param[2];
	} else if (eventNumber == "10") {
		undoArray.push([10, [param[0], JSON.parse(JSON.stringify(globalJSON.mainObjects[param[0]].toolsUsed.splice(param[1], 1)[0])), JSON.parse(JSON.stringify(globalJSON.subcomponent_details[param[0]].details.splice(param[1], 1)[0])) ,param[1]]]);
	}
	localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
	exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
	redoArray.pop();
	drawToCanvas(globalJSON);
}

/*
	Called when the title loses focus or pressed enter

	Saves the title to globalJSON and download file
*/
function saveTitle(e) {
	if (globalJSON["title"] != title.innerHTML) {
		//undoArray.push([5, globalJSON["title"]]);
		globalJSON["title"] = title.innerHTML;
		exportAnchorElement.download = globalJSON["title"] + ".json";
		localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
		exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
		saved = false;
	}
}

/*
	Prevents alert from showing
	Called when the download button is clicked
*/
function downloaded(e) {
	// To get the latest version of the JSON to be exported.
	localStorage.setItem("globalJSON", JSON.stringify(globalJSON)); 
	exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
	saved = true;
}

/*
	zooms in the canvas and moves the slider to appropriate place
*/
function zoomIn() {
	//decreases the value of the slider and saves the value
	if (slider.immediateValue > minScale) { //if slider isnt at the lowest point
		slider.decrement();
		currentScale = slider.immediateValue;
	}
	drawToCanvas(globalJSON);
}

/*
	zooms out the canvas
	see zoomIn()
*/
function zoomOut() {
	//increases value of the slider
	if (slider.immediateValue < maxScale) { //if slider isnt at the highest point
		slider.increment();
		currentScale = slider.immediateValue;
	}
	drawToCanvas(globalJSON);
}

/*
	displays the popup that says popupText at X, Y

	TODO: maybe center better and make popup less fat
*/
function displayPopup(popupText, clientX, clientY) {
	try {
		popupElement.style.visibility = "visible";
		popupElement.innerHTML = popupText;

        if (clientX === null) {
            console.log("function displayPopup bad args");
        } else {
		    popupContainerElement.style.left = clientX + "px";
            popupContainerElement.style.top = clientY + "px";
        }
    } catch(err) {
		console.log("Could not Display popup : " + err.message);
	}
}

/*
	hides popup
*/
function closePopup() {
	popupElement.style.visibility = "hidden";
}

/*
	prevents wierd stuff from happening
*/
function allowDrop(e) {
	e.preventDefault();
}

/*
	Called When the canvas is clicked
	Checks for things (delete edge), set selectedElement, displays description table
*/
var selected = false;
function canvasClick(e) {
	selectedSubElement = null;
	if (e == null) {
		title.blur();
		selectedEdge = null;

		resetTable();
		selectedElement = null; //deselect element
		currentElement = null;
		edge = null;
		return;
	}
	//get coordinates of the click
	title.blur();
	var rect = canvasElement.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;

	//loop through the workflow elements
	var g = globalJSON;
	for (var i = 0; i < g.mainObjects.length; i++) {

		var element = g.mainObjects[i]; //the current element

		if( (x >= (element.startX - 4) / currentScale && x <= (element.endX + 4) / currentScale ) && ( y >= (element.startY - 4) / currentScale && y <= (element.endY + 4) / currentScale ) ) { // checks if click was in bounds of the element
			selectedElement = element.id; //sets the currently selected element to be this element

			if (edge != null && edge != selectedElement) { //check if the edge exists already
				if (checkIfExists()) {
					selectedElement = null; //deselect element
					currentElement = null;
					edge = null;
					drawToCanvas(g);
					return;
				}
				globalJSON.edges.push([edge, selectedElement]);
				undoArray.push([3]);
				/*if (checkIfCycleExists()) {
					alert("You created a cycle!");
					globalJSON.edges.pop();
					undoArray.pop();
				} else {
					redoArray = [];
				}*/
				edge= null;
			}
			
			redoArray = [];
			if (selected == true) {
				break;
			}
			
			selected = true;
			descriptionTable.style.visibility = "visible";
			descriptionTable.editName(element.name);
			descriptionTable.loadDetails(globalJSON.details[i], globalJSON, i);

			drawToCanvas(g); //redraw everything but highlight element
			selectedEdge = null;
			return;
		}
	}
	selectedEdge = null; // sets to null

	resetTable();
	selectedElement = null; //deselect element
	currentElement = null;
	edge = null;
	drawToCanvas(g, e); //draw and if edge click it will be selected
	if (selected == true) {
		selected = false;
		setTimeout(() => canvasClick(e), 10);
	}
}
/*
	Creates copy of template description
*/
function newTemplate() {
	var newInstance = JSON.parse(JSON.stringify(detailTemplate));
	return newInstance;
}

/*
	Clear table and reset it
*/
function resetTable() {
	descriptionTable.clear();
	descriptionTable.style.visibility = "hidden";
}

/*
	Called when object is dropped into the canvas
*/
function drop(e) {

	//setup variables
	var rect = canvasElement.getBoundingClientRect();

	var ctx = canvasElement.getContext("2d");

	var src = localStorage.getItem("currentDragElement"); //currently dragged element

	//create new image object and set it as src
	var imgElement = new Image();
	imgElement.src = src;

	//width and height of original src
	var w = imgElement.width;
	var h = imgElement.height;

	//width and height of new image (keeping same aspect ratio of the old), scale it to height of scalingNum
	var scalingNum = 75;
	w = scalingNum * w /h;
	h = scalingNum;
	imgElement.height = h + "px";
	imgElement.width = w + "px";

	//getting the bounds of the image
	var startX = (e.clientX - rect.left - parseInt(w/2))* currentScale;
	var startY =( e.clientY - rect.top - parseInt(h/2)) * currentScale;
	var endX = startX + w;
	var endY = startY + h;

	var index = checkifOverlapping(startX, startY, endX , endY);//check if overlapping

	var activeWorkflowElement = JSON.parse(localStorage.getItem("activeWorkflowElement")); //The current set of workflow diagrams that is being used ex: "common tasks" and "earthcube tools"

	var newElement = {"id": "d"+(new Date()).getTime(), "name": "", "imageSource": "", "startX": startX, "startY": startY, "endX": endX, "endY": endY, "toolsUsed": []}; //create new element

	//finds which element the currently dragged element adds fields to the new Element
	for( var i = 0; i < activeWorkflowElement.elements.length; i++) {
		if( activeWorkflowElement.elements[i].imageSource == src ) {
			newElement.name = activeWorkflowElement.elements[i].elementName; //saves name
			newElement.imageSource = src; //saves image
		}
	}

	if( index == -1) { // if not overlapping with other element
		globalJSON.mainObjects.push(newElement); //pushed into mainobjects
		globalJSON.details.push(newTemplate());
		globalJSON.subcomponent_details.push({"parentId" : newElement.id, "details": []});

		//draws the image to the canvas
		ctx.drawImage(imgElement, startX/currentScale, startY/currentScale, w/currentScale, h/currentScale);

		undoArray.push([0, null]);
		redoArray = [];
		selectedElement = newElement.id;
		descriptionTable.style.visibility = "visible";
		descriptionTable.editName(newElement.name);
		descriptionTable.loadDetails(globalJSON.details[globalJSON.details.length - 1], globalJSON, globalJSON.details.length - 1);
		drawToCanvas(globalJSON);
	} else {
		var detail = globalJSON.details[index][4]["detail"];
		var addedDetail = detail + ", " + newElement.name;
		var addToElement = globalJSON.mainObjects[index];	
		undoArray.push([9, [index,JSON.parse(JSON.stringify(globalJSON.mainObjects[index])), JSON.parse(JSON.stringify(globalJSON.subcomponent_details[index]))]]);
		redoArray = [];
		addToElement.toolsUsed.push([newElement.name, newElement.imageSource, w, h]);
		//addToElement.endY += scalingNum / 2;
		if (detail == "") {
			globalJSON.details[index][4]["detail"] = newElement.name;
		} else {
			//detail +=", ";
			globalJSON.details[index][4]["detail"] = addedDetail;
		}
		selectedElement = addToElement.id;
		drawToCanvas(globalJSON);
		descriptionTable.style.visibility = "visible";
		descriptionTable.editName(addToElement.name);
		resetTable();
		setTimeout(() => descriptionTable.loadDetails(globalJSON.details[index], globalJSON, index), 10);
		descriptionTable.style.visibility = "visible";

		for(var i = 0; i < globalJSON.subcomponent_details.length; i++) {

			if( globalJSON.subcomponent_details[i].parentId == globalJSON.mainObjects[index].id ) {
				globalJSON.subcomponent_details[i].details.push(newTemplate());
			}

		}
	}

	//replace old globalJSON and download link
	localStorage.setItem("globalJSON", JSON.stringify(globalJSON));

	exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

	saved = false;
	e.preventDefault();
}

function getWorkflowElementById(id) {
	for(var i = 0; i < globalJSON.mainObjects.length; i++) {
		if (globalJSON.mainObjects[i].id === id) {
			return globalJSON.mainObjects[i];
		}
	}
}

/*
	Puts the workflow elements onto the bottom toolbar
	called when and activeWorkflowElement Button is pressed
*/
function populateWorkflowElementsDetail(workflowElementsDetail) {

	var populateWorkflowElementsDetailElement = Polymer.dom(assetAppElement.root).querySelector("#populateDetailsSection");
	populateWorkflowElementsDetailElement.innerHTML = workflowElementsDetail;

}

/*
	returns -1 if false or error

	returns i (index of first element overlapped if true)
*/
function checkifOverlapping(sx, sy, ex, ey) {

	try {

		for(var i = 0; i < globalJSON.mainObjects.length; i++) {

			var overlapValue = isOverlap(sx, sy, ex, ey, globalJSON.mainObjects[i].startX, globalJSON.mainObjects[i].startY, globalJSON.mainObjects[i].endX, globalJSON.mainObjects[i].endY);

			if( overlapValue == true )
				return i;

		}

		return -1;

	} catch(err) {

		return -1;
	}
}

/*
	returns true if there is overlap
*/
function isOverlap(sx1, sy1, ex1, ey1, sx2, sy2, ex2, ey2) {
    return ( !( ey1 < sy2 || sy1 > ey2 || ex1 < sx2 || sx1 > ex2 ) );
}

/*
	Draws the mainObjects  and edges (js) into the  canvas

	the argument e is to tell where the cursor was clicked to tell which edge was selected (i know this is not very elegant but its very efficient)
	most of the time it will be null so just ignore it; only when an edge is clicked it will have effect
*/
function drawToCanvas(js, e) {

	try {

		var ctx = canvasElement.getContext('2d');
		var indexDictionary = {};

		//Special elements that need to dominate(overwrite) over others in the canvas.
		var hoverElement = null;
		var doubleClickElement = null;
		var clickElement = null;

		// Offsets for the title and tools of a main object
		const titleOffset = 20;
		const toolImgOffset = 25; 
		
		// Offsets for the title and tools when a main object is hovered over
		const titleOffsetHover = 30;
		const toolImgOffsetHover = 30; 

		// Offsets for the title and tools when a main object is clicked (single or double)
		const titleOffsetClicked = 30;
		const toolImgOffsetClicked = 35; 

		// zoomed in font value
		const zoomedFont = "18px Arial";

		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

		//draws edges including the selected one
		for(var i = 0; i < js.edges.length; i++) {

			drawEdge(getWorkflowElementById(js.edges[i][0]),getWorkflowElementById(js.edges[i][1]), e);
		}

		//draws elements including the special ones
		for(var i = 0; i < js.mainObjects.length; i++) {

			var mainObject = js.mainObjects[i];

			indexDictionary[mainObject.id] = i;

			ctx.beginPath();
			if( selectedElement == mainObject.id ) {
				ctx.font = zoomedFont;
				if (edge == selectedElement) {
					doubleClickElement = mainObject;

					ctx.fillStyle="black";
					for (var j = 0; j < js.details[i].length; j++) {
						if (globalJSON.details[i][j]["name"] == "Name") {
							ctx.fillText(globalJSON.details[i][j]["detail"], (mainObject.startX + mainObject.endX) / 2 / currentScale, (mainObject.endY+titleOffsetClicked)/currentScale);
						}
					}
				} else {
					clickElement = mainObject;

					ctx.fillStyle="black";
					for (var j = 0; j < js.details[i].length; j++) {
						if (globalJSON.details[i][j]["name"] == "Name") {
							ctx.fillText(globalJSON.details[i][j]["detail"], (mainObject.startX + mainObject.endX) / 2 / currentScale, (mainObject.endY+titleOffsetClicked)/currentScale);
						}
					}
				}
			} else if(mouseOverElement != null && mouseOverElement == mainObject.id) {
				hoverElement = mainObject;

				ctx.fillStyle="black";
				ctx.font = zoomedFont;
				for (var j = 0; j < globalJSON.details[i].length; j++) {
					if (globalJSON.details[i][j]["name"] == "Name") {
						ctx.fillText(globalJSON.details[i][j]["detail"], (mainObject.startX + mainObject.endX) / 2 / currentScale, (mainObject.endY+titleOffsetHover)/currentScale);
					}
				}
			} else {
				ctx.strokeStyle="black";
				ctx.font = "15px Arial";
				var length = mainObject.toolsUsed.length;

				ctx.fillStyle="black";
				for (var j = 0; j < js.details[i].length; j++) {
					if (globalJSON.details[i][j]["name"] == "Name") {
						ctx.fillText(truncateName(globalJSON.details[i][j]["detail"]), (mainObject.startX + mainObject.endX) / 2 / currentScale, (mainObject.endY+titleOffset)/currentScale);
					}
				}
				ctx.font = "20px Arial";
				
				var lengthX = mainObject.startX/currentScale;
				//var lengthY = (mainObject.endY - mainObject.startY)/currentScale;
				for (var j = 0; j < length; j++) {
					var toolImage = new Image();
					toolImage.src = mainObject.toolsUsed[j][1];
					//if (j % 2 == 0) { //if index of tools used of selected item in canvas is even
					if( selectedSubElement != null ) {
						if( selectedSubElement["parentId"] == mainObject.id && selectedSubElement["index"] == j ) {
							ctx.fillStyle = "#00800040";
							ctx.fillRect(lengthX, (mainObject.endY + toolImgOffset)/currentScale, (mainObject.toolsUsed[j][2] + 80)/currentScale/3, (mainObject.toolsUsed[j][3] + 80)/currentScale/3);
							ctx.drawImage(toolImage, lengthX, (mainObject.endY + toolImgOffset)/currentScale, (mainObject.toolsUsed[j][2] + 80)/currentScale/3, (mainObject.toolsUsed[j][3] + 80)/currentScale/3);
							lengthX += (mainObject.toolsUsed[j][2]+100)/currentScale/3;
							continue;
						}
					}
						ctx.drawImage(toolImage, lengthX, (mainObject.endY + toolImgOffset)/currentScale, mainObject.toolsUsed[j][2]/currentScale/3, mainObject.toolsUsed[j][3]/currentScale/3);
						lengthX += (mainObject.toolsUsed[j][2]+20)/currentScale/3;
					//} else {
					//	ctx.drawImage(toolImage, mainObject.startX/currentScale + lengthX, mainObject.endY/currentScale + lengthY*(j/2)/currentScale, lengthX, lengthY-2);
					//}
				}
			}

			var imgElement = new Image();
			imgElement.src = mainObject.imageSource;

			ctx.drawImage(imgElement, mainObject.startX/currentScale, mainObject.startY/currentScale, (mainObject.endX - mainObject.startX)/currentScale, (mainObject.endY - mainObject.startY)/currentScale);


			// if (length %2 ==1) {
			// 	var toolImage = new Image();
			// 	toolImage.src = mainObject.toolsUsed[mainObject.toolsUsed.length -1][1];
			// 	ctx.drawImage(toolImage, mainObject.startX/currentScale, mainObject.endY/currentScale, (mainObject.endX - mainObject.startX)/currentScale/2, (mainObject.endY - mainObject.startY)/currentScale/2 );
			// }
		}

		if( doubleClickElement != null ) {

			mainObject = doubleClickElement;
			ctx.strokeStyle="red";
			ctx.fillStyle="#FF000040";
			ctx.fillRect((mainObject.startX - 5) / currentScale , (mainObject.startY - 5) / currentScale, (mainObject.endX - mainObject.startX + 10)/currentScale, (mainObject.endY - mainObject.startY + 10)/currentScale);

			var lengthX = mainObject.startX/currentScale;
			for (var j = 0; j < mainObject.toolsUsed.length; j++) {
				var toolImage = new Image();
				toolImage.src = mainObject.toolsUsed[j][1];
				ctx.drawImage(toolImage, lengthX, (mainObject.endY + toolImgOffsetClicked)/currentScale, mainObject.toolsUsed[j][2]/currentScale/3, mainObject.toolsUsed[j][3]/currentScale/3);
				lengthX += (mainObject.toolsUsed[j][2]+20)/currentScale/3;
			}

			var imgElement = new Image();
			imgElement.src = mainObject.imageSource;

			ctx.drawImage(imgElement, mainObject.startX/currentScale, mainObject.startY/currentScale, (mainObject.endX - mainObject.startX)/currentScale, (mainObject.endY - mainObject.startY)/currentScale);

		}

		if( clickElement != null ) {

			mainObject = clickElement;
			ctx.strokeStyle = "green";
			ctx.fillStyle="#00800040";
			ctx.fillRect((mainObject.startX - 5) / currentScale , (mainObject.startY - 5) / currentScale, (mainObject.endX - mainObject.startX + 10)/currentScale, (mainObject.endY - mainObject.startY + 10)/currentScale);

			var lengthX = mainObject.startX/currentScale;
			for (var j = 0; j < mainObject.toolsUsed.length; j++) {
				var toolImage = new Image();
				toolImage.src = mainObject.toolsUsed[j][1];
				ctx.drawImage(toolImage, lengthX, (mainObject.endY + toolImgOffsetClicked)/currentScale, mainObject.toolsUsed[j][2]/currentScale/3, mainObject.toolsUsed[j][3]/currentScale/3);
				lengthX += (mainObject.toolsUsed[j][2]+20)/currentScale/3;
			}

			var imgElement = new Image();
			imgElement.src = mainObject.imageSource;

			ctx.drawImage(imgElement, mainObject.startX/currentScale, mainObject.startY/currentScale, (mainObject.endX - mainObject.startX)/currentScale, (mainObject.endY - mainObject.startY)/currentScale);

		}

		if( hoverElement != null ) {

			mainObject = hoverElement;

			var lengthY = (mainObject.endY+9 + toolImgOffsetHover)/currentScale;
			var midpoint = (mainObject.startX + mainObject.endX)/2/currentScale;

			var childStartX = 0;
			var childStartY = 0;
			var childWidth = 0;
			var childHeight = 0;

			childStartY = (mainObject.endY+7)/currentScale;
			for (var j = 0; j < mainObject.toolsUsed.length; j++) {
				if( j == 0 ) {
					childStartX = midpoint - mainObject.toolsUsed[j][2]/2/currentScale;
				}
				
				if( mainObject.toolsUsed[j][2]/currentScale > childWidth ) {
					childWidth = mainObject.toolsUsed[j][2]/currentScale;
				}

				if( midpoint - mainObject.toolsUsed[j][2]/2/currentScale < childStartX ) {
					childStartX = midpoint - mainObject.toolsUsed[j][2]/2/currentScale;
				}

				childHeight += (mainObject.toolsUsed[j][3] + 4)/currentScale;
			}

			childStartX = childStartX - 2;
			childWidth = childWidth + 4;

			if(childStartX != 0) {
				ctx.fillStyle="#F7C96C";
				ctx.clearRect(childStartX, childStartY + toolImgOffsetHover, childWidth, childHeight);
				ctx.fillRect(childStartX, childStartY + toolImgOffsetHover, childWidth, childHeight);
			}

			ctx.strokeStyle = "orange";
			ctx.fillStyle="#F4B942";
			ctx.fillRect((mainObject.startX - 5) / currentScale , (mainObject.startY - 5) / currentScale, (mainObject.endX - mainObject.startX + 10)/currentScale, (mainObject.endY - mainObject.startY + 10)/currentScale);

			for (var j = 0; j < mainObject.toolsUsed.length; j++) {
				var toolImage = new Image();
				toolImage.src = mainObject.toolsUsed[j][1];
				//ctx.fillRect((midpoint - mainObject.toolsUsed[j][2]/2 - 5) / thiis is wrong BTW double divided currentScale currentScale , (lengthY - 5) / currentScale, (mainObject.toolsUsed[j][2] + 10)/currentScale, (mainObject.toolsUsed[j][3] + 10)/currentScale);
				ctx.drawImage(toolImage, midpoint - mainObject.toolsUsed[j][2]/2/currentScale, lengthY, mainObject.toolsUsed[j][2]/currentScale, mainObject.toolsUsed[j][3]/currentScale);
				lengthY +=(mainObject.toolsUsed[j][3]+4)/currentScale;
			}

			var imgElement = new Image();
			imgElement.src = mainObject.imageSource;

			ctx.drawImage(imgElement, mainObject.startX/currentScale, mainObject.startY/currentScale, (mainObject.endX - mainObject.startX)/currentScale, (mainObject.endY - mainObject.startY)/currentScale);

		}

	} catch(err) {
	 	console.log("Could not draw onto canvas : " + err.message);
	}

}

function truncateName(nameString) {
	return ( (nameString.length <= 15) ? nameString: nameString.substring(0, 15) + "..." );
}

var importPopupBool = false;

function importWorkflow(e) {

	try {
		e.stopPropagation();
		var importText = 
		`
		<center id = 'importPopupElement'>Import Workflow Sketch</center>
		<br>
		<input type='file' id='fileToLoad' accept='application/json'>
		<br>
		<button onclick='loadWorkflowSketch()' style="cursor: pointer">Load Workflow</button>
		<br>
		<button onclick='closeImportPopup()' style="cursor: pointer">Close</button>
		`;
		importPopupBool = true;
		displayPopup(importText, e.clientX, e.clientY - 10);

	} catch(err) {
		alert("Could not import workflow sketch : " + err.message);
	}
}

// handler for close button on the Import Sketch pop-up
function closeImportPopup(){
	importPopupBool = false;
	closePopup();
}

function importUnfocused() {
	importPopupBool = false;
	closePopup();
}

function loadWorkflowSketch() {

	try {

		var uploadFileElement = Polymer.dom(assetAppElement.root).querySelector("#fileToLoad").files[0];
		var fileReader = new FileReader();

		fileReader.onload = function(fileLoadedEvent) {
			var textFromFileLoaded = fileLoadedEvent.target.result;
			globalJSON = JSON.parse(textFromFileLoaded);

			globalJSON = updateJSONWithID(globalJSON);

			// reset the import pop-up bool flag so that pop-up can be used to highlight elements
			importPopupBool = false;
			closePopup();

			//setting download link
			localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
			exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

			Polymer.dom(assetAppElement.root).querySelector("#title").innerHTML = globalJSON["title"]; //title change
			exportAnchorElement.download = globalJSON["title"] + ".json"; //download name set to the new one
			canvasClick(fileLoadedEvent); //simulates click in the canvas not on an element to reset all the variables
			selected = false;
		};

		fileReader.readAsText(uploadFileElement, "UTF-8");

	} catch(err) {
		alert("Cannot load Workflow from invalid JSON : " + err.message);
	}

}

var canvasDragElement = null;
var originalDragElement = null;
var dragWorkflowArray = [];

function mouseDownFunction(e) {
	try {
		var g = globalJSON;

		var rect = canvasElement.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;
		for (var i = 0; i < g.mainObjects.length; i++) {

			if( (x >=( g.mainObjects[i].startX - 4)/currentScale && x <= (g.mainObjects[i].endX + 4)/currentScale ) && ( y >= (g.mainObjects[i].startY - 4)/currentScale && y <= (g.mainObjects[i].endY + 4)/currentScale ) ) {

				canvasDragElement = {"element": g.mainObjects[i], "offsetX": (e.clientX - g.mainObjects[i].startX), "offsetY": (e.clientY - g.mainObjects[i].startY)};
				originalDragElement = JSON.parse(JSON.stringify(g.mainObjects[i]));
				return;

			}
		}
		canvasDragElement = null;

		dragWorkflowArray = [x * currentScale,y * currentScale];

	} catch(err) {
		canvasDragElement = null;
		console.log("Could not start drag : " + err.message);
	}
}

function mouseMoveFunction(e) {
	try {
		if (dragWorkflowArray.length != 0) {
			var rect = canvasElement.getBoundingClientRect();
			var x = (e.clientX - rect.left) * currentScale - dragWorkflowArray[0]; //displacemnt x since mouse down
			var y =(e.clientY - rect.top) * currentScale - dragWorkflowArray[1]; //displacemnt y since mouse down
			var length = globalJSON.mainObjects.length;
			for (var i = 0; i < length; i++) {
				globalJSON.mainObjects[i].startX += x;
				globalJSON.mainObjects[i].endX += x;
				globalJSON.mainObjects[i].startY += y;
				globalJSON.mainObjects[i].endY += y;
			}
			dragWorkflowArray = [(e.clientX - rect.left)*currentScale, (e.clientY - rect.top) * currentScale];
			drawToCanvas(globalJSON);
			return;
		}

		if( canvasDragElement == null ) {

			var rect = canvasElement.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;
			var length = globalJSON.mainObjects.length;
			for (var i = 0; i < length; i++) {

				var element = globalJSON.mainObjects[i]; //the current element

				if( x >= element.startX / currentScale && x <= element.endX / currentScale  && y >= element.startY / currentScale && y <= element.endY / currentScale ) { // checks if click was in bounds of the element
					mouseOverElement = element.id; //sets the currently selected element to be this element
					drawToCanvas(globalJSON);
					return;
				}
			}
			mouseOverElement = null;
			drawToCanvas(globalJSON);
		} else {
			var g = globalJSON;
			var xDifference = canvasDragElement.element.startX ;
			var yDifference = canvasDragElement.element.startY;

			canvasDragElement.element.startX = e.clientX - canvasDragElement.offsetX;
			canvasDragElement.element.startY = e.clientY - canvasDragElement.offsetY;

			xDifference =  canvasDragElement.element.startX - xDifference;
			yDifference = canvasDragElement.element.startY - yDifference;

			canvasDragElement.element.endX += xDifference;
			canvasDragElement.element.endY += yDifference;

			setTimeout(() => function() {
				canvasDragElement.element.startX += xDifference;
				canvasDragElement.element.endX += xDifference;
				canvasDragElement.element.startY += yDifference;
				canvasDragElement.element.endY += yDifference;
			}, 30);

			drawToCanvas(globalJSON);
			localStorage.setItem("globalJSON", JSON.stringify(g));
			exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
		}

	} catch(err) {
		console.log("Failed to drag : " + err.message);
	}
}

function mouseUpFunction(e) {

	try {
		dragWorkflowArray = [];

		if( canvasDragElement == null )
			return;

		if( canvasDragElement.element.startX == originalDragElement.startX && canvasDragElement.element.endX == originalDragElement.endX && canvasDragElement.element.startY == originalDragElement.startY && canvasDragElement.element.endY == originalDragElement.endY ) {
			canvasDragElement = null;
			return;
		}

		undoArray.push([2, originalDragElement]);
		redoArray = [];

		for( var i = 0; i < globalJSON.mainObjects.length; i++ ) {

			if( globalJSON.mainObjects[i].id == canvasDragElement.element.id )
				continue;

			if( isOverlap(canvasDragElement.element.startX, canvasDragElement.element.startY, canvasDragElement.element.endX, canvasDragElement.element.endY, globalJSON.mainObjects[i].startX, globalJSON.mainObjects[i].startY, globalJSON.mainObjects[i].endX, globalJSON.mainObjects[i].endY) == true) {
				for( var j = 0; j < globalJSON.mainObjects.length; j++ ) {
					if( globalJSON.mainObjects[j].id == canvasDragElement.element.id ) {
						globalJSON.mainObjects[j] = originalDragElement;
						canvasDragElement = null;
						localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
						exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
						drawToCanvas(globalJSON);
						return;
					}
				}
			}
		}
		canvasDragElement = null;
		

	} catch(err) {

		alert("Could not move element : " + err.message);
	}
}
