var sourceJSON;
var exportAnchorElement;
var assetAppElement;
var popupElement;
var popupContainerElement;
var canvasElement; // fake canvas before zoom and stuff
var editArray;
var edgeArray;
var moveElement;
var mouseOverElement;
var selectedElement;
var descriptionElement;

var globalJSON = {"mainObjects": [], "edges": []}; // the workflow elements and edges

/*
	Helpers for the canvas
*/

var slider;
var currentScale;
var minScale;
var maxScale;
var sketchCache;
var step;

/*
	 Called when body is initialized
	 
	 TO DO: change the name of the workflow json file and have the user be able to title workflow
		 MOVE DESCRIPTION SECTION TO APPROPRIATE PLACE and implement it
		 FIX ZOOM
		 MAYBE ADD ERROR CATCHING
		Add refresh, closer warning
		make anchor into buttons and not refresh all the time
*/
function initialize() {
	

	localStorage.setItem("globalJSON", JSON.stringify(globalJSON)); //maps tuple of two lists (main Objects and edges)

	assetAppElement = Polymer.dom(this.root).querySelector("asset-app"); //adds asset-app as a field

	exportAnchorElement = Polymer.dom(assetAppElement.root).querySelector("#exportAnchor"); //adds export button as a field
	exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON"))); // returns the workflow file and the globalJSON
	exportAnchorElement.setAttribute("download", "Workflow.json");// change the name (workflow.json) to the title

	//adds popup element as field
	popupElement = Polymer.dom(assetAppElement.root).querySelector("#popup");
	popupContainerElement = Polymer.dom(assetAppElement.root).querySelector("#popupContainer");

	canvasElement = Polymer.dom(assetAppElement.root).querySelector("#workflowSketchCanvas"); // the canvas added

	// not sure yet lmao
	moveElement = null;
	mouseOverElement = null;
	selectedElement = null; // element that is currently selected
	sourceJSON = null;

	edgeArray = [];
	
    descriptionElement = Polymer.dom(assetAppElement.root).querySelector("#descriptionSection"); //description section added
	
	//canvas container: adds the canvas so it doesnt expand and stuff
    var canvasholder = Polymer.dom(assetAppElement.root).querySelector("#canvasContainerSection");
    canvasElement.width = canvasholder.offsetWidth;
    canvasElement.height = canvasholder.offsetHeight;
	
	//this is zoom stuff just saving all the properties of the slider so we dont have to keep accessing it
	slider = Polymer.dom(assetAppElement.root).querySelector("#sizeSlider");
	currentScale = slider.immediateValue;
	minScale = slider.min;
	maxScale = slider.max;
	step = slider.step;
}	


/* 
	called when mouse wheel in motion over the canvas
*/
function mouseScrollingCanvas(e) { //REMMEBER TO IMPLEMEMNT CHANGINIG THE SLIDER AS WELL OR REMOVE EDITABLE
	if (e.deltaY > 0) { //scroll down
		if (currentScale < maxScale) { //if slider isnt at the lowest point
			zoomOut();
		}
	} else {//scroll up
		if (currentScale > minScale) { //if slider isnt at the lowest point
			zoomIn();
		}
	}
	descriptionElement.innerHTML=descriptionElement.innerHTML + currentScale + "<br />"; //testing stuff remove later
}

/*
	zooms in the canvas and moves the slider to appropriate place
	Have 2 canvas, one that is hidden and one displayed, and the hidden one stores a copy of the workflow that is min scaled (most zoomed in) and 
		the displayed canvas zooms out accordingly
	Just zooming in and out is not feasible because quality gets shitty when zoomed out as pixels are lost

	Another way is to save locations of all the elements and edges and draw accordingly everytime we zoom out

	Also im thinking of adding a cache for the result canvas so people dont lag too hard if scrolling is spammed this is of lesser priority
*/
function zoomIn() {
	//decreases the value of the slider and saves the value
	slider.decrement();
	currentScale = slider.immediateValue;

	//other stuff that was of the old implementation
	var newWidth = canvasElement.width * currentScale;
	var newHeight = canvasElement.height * currentScale;
	// var imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
	// var copy = document.createElement('canvas');
	// copy.width = canvasElement.width;
	// copy.height = canvasElement.height;
	// copy.getContext("2d").putImageData(imageData,0, 0);
    
    // canvasElement.getContext("2d").save();
    // canvasElement.getContext("2d").translate(-((newWidth-canvasElement.width)/2), -((newHeight-canvasElement.height)/2));
    // canvasElement.getContext("2d").scale(currentScale, currentScale);
    // canvasElement.getContext("2d").clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasElement.getContext("2d").drawImage(copy, 0, 0);
    // canvasElement.getContext("2d").restore();
}

/* 
	zooms out the canvas
	see zoomIn()
*/
function zoomOut() {
	//increases value of the slider
	slider.increment();
	currentScale = slider.immediateValue;

	//other stuff that was of the old implementation
	var newWidth = canvasElement.width * currentScale;
	var newHeight = canvasElement.height * currentScale;
	// var imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height); // saves current image
	// var copy = document.createElement('canvas'); // makes canvas element (but chill its invisible)
	// copy.width = canvasElement.width; // copies 
	// copy.height = canvasElement.height;
	// copy.getContext("2d").putImageData(imageData,0, 0);
    
    // canvasElement.getContext("2d").save();
    // canvasElement.getContext("2d").translate(-((newWidth-canvasElement.width)/2), -((newHeight-canvasElement.height)/2));
    // canvasElement.getContext("2d").scale(currentScale, currentScale);
    // canvasElement.getContext("2d").clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasElement.getContext("2d").drawImage(copy, 0, 0);
    // canvasElement.getContext("2d").restore();
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
*/
function allowDrop(e) { //not comm yet
	e.preventDefault();
}

/*
	Called When the canvas is clicked

	?????
	TODO: remove delete button and have backspace/ deleted button be delete instead
		make double click be the edge drawer instead
		show the description on the side instead on the top
*/
function canvasClick(e) {
	//get coordinates of the click
	var rect = canvasElement.getBoundingClientRect();
	var x = e.clientX - rect.left; 
	var y = e.clientY - rect.top;

	//loop through the workflow elements
	var g = globalJSON;
	for (var i = 0; i < g.mainObjects.length; i++) {

		var element = g.mainObjects[i]; //the current element

		if( (x >= element.startX - 4 && x <= element.endX + 4 ) && ( y >= element.startY - 4 && y <= element.endY + 4 ) ) { // checks if click was in bounds of the element
			selectedElement = element.id; //sets the currently selected element to be this element
			drawToCanvas(g); //redraw everything but highlight element

			if( checkForDeleteClick(element, x, y) == true ) { //if delete TODO: change this
				deleteNode(element.id);
				return;
			}

			if( checkForEdgeDrawClick(element, element.id, x, y) == true ) {//if edge is touched TODO:change this
				drawEdge(true);
				return;
			}

			for(var j = 0; j < element.objectsArray.length; j++) { // get the desrption and stuff i have no idea what this does yet and why need loop? TODO: change this

				if( (x >= element.objectsArray[j].startX && x <= element.objectsArray[j].endX ) && ( y >= element.objectsArray[j].startY && y <= element.objectsArray[j].endY ) ) {
					
					var n = element.objectsArray[j].name;
					var d = element.objectsArray[j].description;

					var st = "<b>" + n + "</b>";
					
					for(var p = 0; p < element.objectsArray[j].properties.length; p++) {
						st += "<br><b>" + element.objectsArray[j].properties[p].propertyName + " : </b>" + element.objectsArray[j].properties[p].propertyValue;
					}

					st += "<br>	<button onclick=editProperties()>Edit</button> <button onclick=closePopup()>Close</button>";

					var dispX = element.objectsArray[j].startX + ((element.objectsArray[j].endX - element.objectsArray[j].startX) / 2);

					editArray = [i, j, (dispX + rect.left), (element.objectsArray[j].startY + rect.top)];

					displayPopup(st, dispX + rect.left, element.objectsArray[j].startY + rect.top);
					return;

				}	

			}
			closePopup();
			return;
		}
	}

	closePopup();
	selectedElement = null; //deselect element
	drawToCanvas(g); //draw that

}

/*
	Called when object is dropped into the canvas

	I added a scaling variable maybe will come to play in zooming
	TODO: minor bug: if something not an object is dragged then the thing bugs out
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
	var startX = e.clientX - rect.left - parseInt(w/2);
	var startY = e.clientY - rect.top - parseInt(h/2);
	var endX = startX + w;
	var endY = startY + h;

	var index = checkifOverlapping(startX, startY, endX, endY);//check if overlapping

	var activeWorkflowElement = JSON.parse(localStorage.getItem("activeWorkflowElement")); //isnt this the same thing as currentDragElement?

	var newElement = {"id": "d"+(new Date()).getTime(), "name": "", "imageSource": "", "properties": [], "startX": startX, "startY": startY, "endX": endX, "endY": endY}; //create new element

	//keeps the images and descriptions consistent unsure what active workflowelement is?
	for( var i = 0; i < activeWorkflowElement.elements.length; i++) {
		if( activeWorkflowElement.elements[i].imageSource == src ) {
			newElement.name = activeWorkflowElement.elements[i].elementName;
			newElement.imageSource = src;
			
			for (var j = 0; j < activeWorkflowElement.elements[i].properties.length; j++) {
				var value = null;

				if(activeWorkflowElement.elements[i].properties[j].propertyType == "Number") {
					value = 0;
				} else if(activeWorkflowElement.elements[i].properties[j].propertyType == "Boolean") {
					value = "false";
				} else {
					value = "";
				}

				newElement.properties.push({"propertyName": activeWorkflowElement.elements[i].properties[j].propertyName, "propertyType": activeWorkflowElement.elements[i].properties[j].propertyType, "propertyValue": value});

			}
		}
	}

	if( index == -1) { //not overlapping with other element
		var mainObject = {"id": "m"+(new Date()).getTime(), "startX": (startX - 5), "startY": (startY - 17), "endX": (endX + 5), "endY": (endY + 5), objectsArray: [newElement]};
		globalJSON.mainObjects.push(mainObject);
		ctx.drawImage(imgElement ,startX, startY, w, h);

		ctx.beginPath();
		ctx.strokeStyle="black";
		ctx.rect(mainObject.startX, mainObject.startY, mainObject.endX - mainObject.startX, mainObject.endY - mainObject.startY);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle="black";
		ctx.moveTo(mainObject.endX - 10, mainObject.startY + 4);
		ctx.lineTo(mainObject.endX - 4, mainObject.startY + 10);
		ctx.moveTo(mainObject.endX - 4, mainObject.startY + 4);
		ctx.lineTo(mainObject.endX - 10, mainObject.startY + 10);
		ctx.rect(mainObject.endX - 12, mainObject.startY + 2, 10, 10);
		ctx.stroke();

		drawEdgeConnectors(mainObject.startX, mainObject.startY, mainObject.endX, mainObject.endY);

	} else { //overlapping with another element (very gltichy) makes them stack

	// 	newElement.startX = g.mainObjects[index].objectsArray[0].startX;
	// 	newElement.startY = g.mainObjects[index].endY + 5;
	// 	newElement.endX = g.mainObjects[index].objectsArray[0].startX + w;
	// 	newElement.endY = g.mainObjects[index].endY + 5 + h;

	// 	if( w > (g.mainObjects[index].endX - g.mainObjects[index].startX - 10) ) {
	// 		g.mainObjects[index].endX = g.mainObjects[index].objectsArray[0].startX + w + 5;

	// 	}

	// 	g.mainObjects[index].endY = g.mainObjects[index].endY + h + 10;
		
	// 	g.mainObjects[index].objectsArray.push(newElement);


	// 	for( var k = 0; k < g.mainObjects[index].objectsArray.length; k++ ) {

	// 		var difference = g.mainObjects[index].objectsArray[k].endX - g.mainObjects[index].objectsArray[k].startX;
	// 		difference = (g.mainObjects[index].endX - g.mainObjects[index].startX - difference) / 2;
			
	// 		var originalWidth = g.mainObjects[index].objectsArray[k].endX - g.mainObjects[index].objectsArray[k].startX;
	// 		g.mainObjects[index].objectsArray[k].startX	 = g.mainObjects[index].startX + difference;
	// 		g.mainObjects[index].objectsArray[k].endX = g.mainObjects[index].objectsArray[k].startX + originalWidth;

	// 	}

	// 	drawToCanvas(g);

	// 	drawEdgeConnectors(g.mainObjects[index].startX, g.mainObjects[index].startY, g.mainObjects[index].endX, g.mainObjects[index].endY);
	}

	//replace old globalJSON and download link
	localStorage.setItem("globalJSON", JSON.stringify(globalJSON));

	exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

}

function populateWorkflowElementsDetail(workflowElementsDetail) {

	var populateWorkflowElementsDetailElement = Polymer.dom(assetAppElement.root).querySelector("#populateDetailsSection");
	populateWorkflowElementsDetailElement.innerHTML = workflowElementsDetail;

}

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

function isOverlap(sx1, sy1, ex1, ey1, sx2, sy2, ex2, ey2) {
    return ( !( ey1 < sy2 || sy1 > ey2 || ex1 < sx2 || sx1 > ex2 ) );
}

function editProperties() {
	try {

		var g = globalJSON;
		var editElement = g.mainObjects[editArray[0]].objectsArray[editArray[1]];
		var editString = "<div style='text-align: left'><center><b>" + editElement.name + "</b></center>";

		closePopup();
		
		for (var i = 0; i < editElement.properties.length; i++) {
			editString += "<br>" + editElement.properties[i].propertyName + " : <input id='" + editElement.properties[i].propertyName + "' type='text'>";
		}
		
		editString += "</div>";

		editString += "<center><button onclick='submitProperties()'>Submit</button>  <button onclick='closePopup()'>Close</button></center>";

		displayPopup(editString, editArray[2], editArray[3]);

	} catch(err) {
		alert("Unable to edit properties : " + err.message);
	}
}

function submitProperties() {
	try {
		var g = globalJSON;

		for (var i = 0; i < g.mainObjects[editArray[0]].objectsArray[editArray[1]].properties.length; i++) {
			var property = g.mainObjects[editArray[0]].objectsArray[editArray[1]].properties[i].propertyName;
			var value = Polymer.dom(assetAppElement.root).querySelector("#" + property).value;
			g.mainObjects[editArray[0]].objectsArray[editArray[1]].properties[i].propertyValue = value;
		}

		globalJSON = g;

		localStorage.setItem("globalJSON", JSON.stringify(g));
		exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

		closePopup();
	} catch(err) {
		alert("Failed to submit : " + err.message);
	}
}

function drawEdgeConnectors(startX, startY, endX, endY) {

	try {

		var midX = startX + ((endX - startX) / 2);
		var midY = startY + ((endY - startY) / 2);

		var ctx = canvasElement.getContext('2d');

		ctx.fillStyle = "black";

		ctx.fillRect(midX - 4, startY - 4, 8, 8);

		ctx.fillRect(midX - 4, endY - 4, 8, 8);

		ctx.fillRect(startX - 4, midY - 4, 8, 8);

		ctx.fillRect(endX - 4, midY - 4, 8, 8);

	} catch(err) {

	}

}

function checkForEdgeDrawClick(obj, i, x, y) {

	try {
		
		var midX = obj.startX + ((obj.endX - obj.startX) / 2);
		var midY = obj.startY + ((obj.endY - obj.startY) / 2);

		if( (x >= obj.startX - 4 && x <= obj.startX + 4 ) && ( y >= midY - 4 && y <= midY + 4 ) ) {
			edgeArray.push({"id": i, "x": obj.startX - 4, "y": midY, "side": "left"});
			return true;
		}

		if( (x >= midX - 4 && x <= midX + 4 ) && ( y >= obj.startY - 4 && y <= obj.startY + 4 ) ) {
			edgeArray.push({"id": i, "x": midX, "y": obj.startY - 4, "side": "top"});
			return true;
		}

		if( (x >= obj.endX - 4 && x <= obj.endX + 4 ) && ( y >= midY - 4 && y <= midY + 4 ) ) {
			edgeArray.push({"id": i, "x": obj.endX + 4, "y": midY, "side": "right"});
			return true;
		}

		if( (x >= midX - 4 && x <= midX + 4 ) && ( y >= obj.endY - 4 && y <= obj.endY + 4 ) ) {
			edgeArray.push({"id": i, "x": midX, "y": obj.endY + 4, "side": "bottom"});
			return true;
		}

		return false;

	} catch(err) {
		alert("Cannot draw edge : " + err.message);
		edgeArray = [];
		return false;
	}

}

function checkForDeleteClick(obj, x, y) {

	try {

		if( (x >= obj.endX - 12 && x <= obj.endX - 2 ) && ( y >= obj.startY + 2 && y <= obj.startY + 12 ) ) {

			return true;
		}

		return false;

	} catch(err) {
		alert("Cannot delete edge : " + err.message);
		return false;
	}

}

function drawEdge(flag) {

	try {

		if( edgeArray.length < 2 )
			return;
		
		if( edgeArray.length > 2 ) {
			var lastElement = edgeArray.pop(0);
			edgeArray = [];
			edgeArray.push(lastElement);
			console.log("ASDASDSD : " + edgeArray.length);
			return;
		}
			

		if( edgeArray[0].id == edgeArray[1].id ) {

			edgeArray = [];
			return;

		}


		var ctx = canvasElement.getContext('2d');

		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.moveTo(edgeArray[0].x, edgeArray[0].y);
		

		var arrowPath = new Path2D();		

		if( edgeArray[1].side == "left" ) {
			arrowPath.moveTo(edgeArray[1].x, edgeArray[1].y);
			arrowPath.lineTo(edgeArray[1].x - 10, edgeArray[1].y - 10);
			arrowPath.lineTo(edgeArray[1].x - 10, edgeArray[1].y + 10);
			ctx.lineTo(edgeArray[1].x - 10, edgeArray[1].y);
		} else if( edgeArray[1].side == "top" ) {
			arrowPath.moveTo(edgeArray[1].x, edgeArray[1].y);
			arrowPath.lineTo(edgeArray[1].x - 10, edgeArray[1].y - 10);
			arrowPath.lineTo(edgeArray[1].x + 10, edgeArray[1].y - 10);
			ctx.lineTo(edgeArray[1].x, edgeArray[1].y - 10);
		}  else if( edgeArray[1].side == "right" ) {
			arrowPath.moveTo(edgeArray[1].x, edgeArray[1].y);
			arrowPath.lineTo(edgeArray[1].x + 10, edgeArray[1].y - 10);
			arrowPath.lineTo(edgeArray[1].x + 10, edgeArray[1].y + 10);
			ctx.lineTo(edgeArray[1].x + 10, edgeArray[1].y);
		} else {
			arrowPath.moveTo(edgeArray[1].x, edgeArray[1].y);
			arrowPath.lineTo(edgeArray[1].x - 10, edgeArray[1].y + 10);
			arrowPath.lineTo(edgeArray[1].x + 10, edgeArray[1].y + 10);
			ctx.lineTo(edgeArray[1].x, edgeArray[1].y + 10);
		}

		ctx.stroke();
		ctx.fill(arrowPath);
		
		if(flag == false) {

		} else {
			
			var g = globalJSON;

			g.edges.push({"from": edgeArray[0].id, "to": edgeArray[1].id, "fromSide": edgeArray[0].side, "toSide": edgeArray[1].side});

			globalJSON = g;
			localStorage.setItem("globalJSON", JSON.stringify(g));
			exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
		}

		edgeArray = [];

	} catch(err) {
		alert("Cannot draw edge : " + err.message);
		edgeArray = [];
	}

}

function drawToCanvas(js) {

	try {
		
		var ctx = canvasElement.getContext('2d');
		var indexDictionary = {};

		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

		for(var i = 0; i < js.mainObjects.length; i++) {

			var mainObject = js.mainObjects[i];

			indexDictionary[mainObject.id] = i;

			ctx.beginPath();
			if( selectedElement == mainObject.id ) {
				ctx.strokeStyle = "green";
				ctx.fillStyle="green";
				ctx.fillRect(mainObject.startX, mainObject.startY, mainObject.endX - mainObject.startX, mainObject.endY - mainObject.startY);
				ctx.fillStyle="black";
			} else if( mouseOverElement == mainObject.id ) {
				ctx.strokeStyle="orange";
				ctx.fillStyle="orange";
				ctx.fillRect(mainObject.startX, mainObject.startY, mainObject.endX - mainObject.startX, mainObject.endY - mainObject.startY);
				ctx.fillStyle="black";
			} else {
				ctx.strokeStyle="black";
			}
			ctx.rect(mainObject.startX, mainObject.startY, mainObject.endX - mainObject.startX, mainObject.endY - mainObject.startY);
			ctx.stroke();

			ctx.beginPath();
			ctx.strokeStyle="black";
			ctx.moveTo(mainObject.endX - 10, mainObject.startY + 4);
			ctx.lineTo(mainObject.endX - 4, mainObject.startY + 10);
			ctx.moveTo(mainObject.endX - 4, mainObject.startY + 4);
			ctx.lineTo(mainObject.endX - 10, mainObject.startY + 10);
			ctx.rect(mainObject.endX - 12, mainObject.startY + 2, 10, 10);
			ctx.stroke();

			for(var j = 0; j < mainObject.objectsArray.length; j++) {

				var element = mainObject.objectsArray[j];

				var imgElement = new Image();
				imgElement.src = element.imageSource;

				ctx.drawImage(imgElement, element.startX, element.startY, element.endX - element.startX, element.endY - element.startY);

				if( mainObject.objectsArray.length > 1 && j < mainObject.objectsArray.length - 1 ) {
					ctx.beginPath();
					ctx.strokeStyle="black";
					ctx.moveTo(mainObject.startX, element.endY + 5);
					ctx.lineTo(mainObject.endX, element.endY + 5);
					ctx.stroke();
				}

				drawEdgeConnectors(mainObject.startX, mainObject.startY, mainObject.endX, mainObject.endY);

			}

		}
		
		for(var i = 0; i < js.edges.length; i++) {

			var fromID = js.edges[i].from;
			var fromSide = js.edges[i].fromSide;
			var fromCoords = redrawEdgeHelper(js.mainObjects[indexDictionary[fromID]], fromSide);

			var toID = js.edges[i].to;
			var toSide = js.edges[i].toSide;
			var toCoords = redrawEdgeHelper(js.mainObjects[indexDictionary[toID]], toSide);

			ctx.beginPath();
			ctx.strokeStyle = "black";
			ctx.moveTo(fromCoords.x, fromCoords.y);
			
			var arrowPath = new Path2D();		

			if( toSide == "left" ) {
				arrowPath.moveTo(toCoords.x, toCoords.y);
				arrowPath.lineTo(toCoords.x - 10, toCoords.y - 10);
				arrowPath.lineTo(toCoords.x - 10, toCoords.y + 10);
				ctx.lineTo(toCoords.x - 10, toCoords.y);
			} else if( toSide == "top" ) {
				arrowPath.moveTo(toCoords.x, toCoords.y);
				arrowPath.lineTo(toCoords.x - 10, toCoords.y - 10);
				arrowPath.lineTo(toCoords.x + 10, toCoords.y - 10);
				ctx.lineTo(toCoords.x, toCoords.y - 10);
			}  else if( toSide == "right" ) {
				arrowPath.moveTo(toCoords.x, toCoords.y);
				arrowPath.lineTo(toCoords.x + 10, toCoords.y - 10);
				arrowPath.lineTo(toCoords.x + 10, toCoords.y + 10);
				ctx.lineTo(toCoords.x + 10, toCoords.y);
			} else {
				arrowPath.moveTo(toCoords.x, toCoords.y);
				arrowPath.lineTo(toCoords.x - 10, toCoords.y + 10);
				arrowPath.lineTo(toCoords.x + 10, toCoords.y + 10);
				ctx.lineTo(toCoords.x, toCoords.y + 10);
			}

			ctx.stroke();
			ctx.fill(arrowPath);


		}


	} catch(err) {
	 	console.log("Could not draw onto canvas : " + err.message);
	}

}

function redrawEdgeHelper(obj, side) {

	try {
		var coords = {"x": 0, "y": 0};

		var midX = obj.startX + ((obj.endX - obj.startX) / 2);
		var midY = obj.startY + ((obj.endY - obj.startY) / 2);

		if( side == "left" ) {

			coords.x = obj.startX - 4;
			coords.y = midY;

		} else if( side == "top" ) {

			coords.x = midX;
			coords.y = obj.startY - 4;

		} else if( side == "right" ) {

			coords.x = obj.endX + 4;
			coords.y = midY;

		} else {

			coords.x = midX;
			coords.y = obj.endY + 4;

		}

		return coords;

	} catch(err) {
		console.log("Edge redraw helper failed : " + err.message);
		return null;
	}

}

function importWorkflow(e) {

	try {

		var importText = "<center>Import Workflow Sketch</center><br><input type='file' id='fileToLoad' accept='application/json'><br><button onclick='loadWorkflowSketch()'>Load Workflow</button>";

		displayPopup(importText, e.clientX, e.clientY - 10);

	} catch(err) {
		alert("Could not import workflow sketch : " + err.message);
	}
}

function loadWorkflowSketch() {

	try {

		var uploadFileElement = Polymer.dom(assetAppElement.root).querySelector("#fileToLoad").files[0];
		var fileReader = new FileReader();

		fileReader.onload = function(fileLoadedEvent) {
			var textFromFileLoaded = fileLoadedEvent.target.result;
			globalJSON = JSON.parse(textFromFileLoaded);
			drawToCanvas(globalJSON);
			closePopup();
			localStorage.setItem("globalJSON", JSON.stringify(globalJSON));
			exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
		};
	  
		fileReader.readAsText(uploadFileElement, "UTF-8");

	} catch(err) {
		alert("Cannot load Workflow from invalid JSON : " + err.message);
	}

}

function deleteNode(id) {

	try {

		var g = globalJSON;
		var deletionFlag = false;

		for( var i = 0; i < g.mainObjects.length; i++ ) {

			if( g.mainObjects[i].id == id ) {

				g.mainObjects.splice(i, 1);
				deletionFlag = true;
				break;

			}

		}

		var j = 0;

		while( true ) {

			if(j >= g.edges.length)
				break;

			if( g.edges[j].from == id || g.edges[j].to == id ) {

				g.edges.splice(j, 1);
				deletionFlag = true;
				
			} else {
				j++;
			}

		}

		if(deletionFlag == true) {

			globalJSON = g;
			localStorage.setItem("globalJSON", JSON.stringify(g));
			exportAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
			drawToCanvas(g);
		}

	} catch(err) {
		alert("Could not delete node : " + err.message);
	}
}

var canvasDragElement = null;
var originalDragElement = null;

function mouseDownFunction(e) {
	try {
		var g = globalJSON;
		var x = e.clientX - canvasElement.getBoundingClientRect().left;
		var y = e.clientY - canvasElement.getBoundingClientRect().top;
		for (var i = 0; i < g.mainObjects.length; i++) {
		
			if( (x >= g.mainObjects[i].startX - 4 && x <= g.mainObjects[i].endX + 4 ) && ( y >= g.mainObjects[i].startY - 4 && y <= g.mainObjects[i].endY + 4 ) ) {

				canvasDragElement = {"element": g.mainObjects[i], "offsetX": (e.clientX - g.mainObjects[i].startX), "offsetY": (e.clientY - g.mainObjects[i].startY)};
				originalDragElement = JSON.parse(JSON.stringify(g.mainObjects[i]));
				return;

			}
		}

		canvasDragElement = null;

	} catch(err) {
		canvasDragElement = null;
		console.log("Could not start drag : " + err.message);
	}
}

function mouseMoveFunction(e) {
	try {

		if( canvasDragElement == null ) {
/*
			var g = globalJSON;
			var rect = canvasElement.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;

			for( var i = 0; i < g.mainObjects.length; i++ ) {

				if( (x >= g.mainObjects[i].startX - 4 && x <= g.mainObjects[i].endX + 4 ) && ( y >= g.mainObjects[i].startY - 4 && y <= g.mainObjects[i].endY + 4 ) ) {

					mouseOverElement = g.mainObjects[i].id;
					drawToCanvas(g);
					return;

				}

			}*/

			mouseOverElement = null;
			//drawToCanvas(g);

		} else {
			console.log("here");
			var g = globalJSON;
			var xDifference = canvasDragElement.element.startX;
			var yDifference = canvasDragElement.element.startY;

			canvasDragElement.element.startX = e.clientX - canvasDragElement.offsetX;
			canvasDragElement.element.startY = e.clientY - canvasDragElement.offsetY;

			xDifference =  canvasDragElement.element.startX - xDifference;
			yDifference = canvasDragElement.element.startY - yDifference;

			canvasDragElement.element.endX += xDifference;
			canvasDragElement.element.endY += yDifference;

			for( var i = 0; i < canvasDragElement.element.objectsArray.length; i++ ) {

				canvasDragElement.element.objectsArray[i].startX += xDifference;
				canvasDragElement.element.objectsArray[i].endX += xDifference;
				canvasDragElement.element.objectsArray[i].startY += yDifference;
				canvasDragElement.element.objectsArray[i].endY += yDifference;

			}

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

		if( canvasDragElement == null )
			return;

		if( canvasDragElement.element.startX == originalDragElement.startX && canvasDragElement.element.endX == originalDragElement.endX && canvasDragElement.element.startY == originalDragElement.startY && canvasDragElement.element.endY == originalDragElement.endY ) {
			canvasDragElement = null;
			return;
		}

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