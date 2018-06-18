var sourceJSON;
var importAnchorElement;
var assetAppElement;
var popupElement;
var popupContainerElement;
var canvasElement;
var editArray;
var edgeArray;
var moveElement;
var mouseOverElement;
var selectedElement;
var descriptionElement;

var globalJSON = {"mainObjects": [], "edges": []};

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
*/

function initialize() {
	

	localStorage.setItem("globalJSON", JSON.stringify(globalJSON));

	assetAppElement = Polymer.dom(this.root).querySelector("asset-app");

	importAnchorElement = Polymer.dom(assetAppElement.root).querySelector("#exportAnchor");
	importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
	importAnchorElement.setAttribute("download", "Workflow.json");

	popupElement = Polymer.dom(assetAppElement.root).querySelector("#popup");
	popupContainerElement = Polymer.dom(assetAppElement.root).querySelector("#popupContainer");

	canvasElement = Polymer.dom(assetAppElement.root).querySelector("#workflowSketchCanvas");

	moveElement = null;
	mouseOverElement = null;
	selectedElement = null;
	sourceJSON = null;

	edgeArray = [];
    
    descriptionElement = Polymer.dom(assetAppElement.root).querySelector("#descriptionSection");
    
    var canvasholder = Polymer.dom(assetAppElement.root).querySelector("#canvasContainerSection");
    canvasElement.width = canvasholder.offsetWidth;
    canvasElement.height = canvasholder.offsetHeight;
    
	slider = Polymer.dom(assetAppElement.root).querySelector("#sizeSlider");
	currentScale = slider.immediateValue;
	minScale = slider.min;
	maxScale = slider.max;
	step = slider.step;
}	

function mouseScrollingCanvas(e) { //REMMEBER TO IMPLEMEMNT CHANGINIG THE SLIDER AS WELL OR REMOVE EDITABLE
	if (e.deltaY > 0) {
		if (currentScale > minScale) {
			zoomIn();
		}
		
		
	} else {
		if (currentScale < maxScale) {
			zoomOut();
		}

	}
	
}

function zoomIn() {
	slider.increment();
	currentScale -= step;
	var newWidth = canvasElement.width * currentScale;
	var newHeight = canvasElement.height * currentScale;
	var imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
	var copy = document.createElement('canvas');
	copy.width = canvasElement.width;
	copy.height = canvasElement.height;
	copy.getContext("2d").putImageData(imageData,0, 0);
    
    canvasElement.getContext("2d").save();
    canvasElement.getContext("2d").translate(-((newWidth-canvasElement.width)/2), -((newHeight-canvasElement.height)/2));
    canvasElement.getContext("2d").scale(currentScale, currentScale);
    canvasElement.getContext("2d").clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.getContext("2d").drawImage(copy, 0, 0);
    canvasElement.getContext("2d").restore();
}

function zoomOut() {
	slider.decrement();
	currentScale += step;
	var newWidth = canvasElement.width * currentScale;
	var newHeight = canvasElement.height * currentScale;
	var imageData = canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
	var copy = document.createElement('canvas');
	copy.width = canvasElement.width;
	copy.height = canvasElement.height;
	copy.getContext("2d").putImageData(imageData,0, 0);
    
    canvasElement.getContext("2d").save();
    canvasElement.getContext("2d").translate(-((newWidth-canvasElement.width)/2), -((newHeight-canvasElement.height)/2));
    canvasElement.getContext("2d").scale(currentScale, currentScale);
    canvasElement.getContext("2d").clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.getContext("2d").drawImage(copy, 0, 0);
    canvasElement.getContext("2d").restore();
}

/*
    
*/
function displayPopup(popupText, clientX, clientY) {
	try {
		popupElement.style.visibility = "visible";
		popupElement.innerHTML = popupText;

        if (clientX === null) {
            
        } else {
		    popupContainerElement.style.left = clientX + "px";
            popupContainerElement.style.top = clientY + "px";
        }
    } catch(err) {
		console.log("Could not Display popup : " + err.message);
	}
}

function closePopup() {
	popupElement.style.visibility = "hidden";
}

function allowDrop(e) {
	e.preventDefault();
}

function canvasClick(e) {
	var canvasholder = Polymer.dom(assetAppElement.root).querySelector("#canvasContainerSection");
    descriptionElement.innerHTML = canvasholder.offsetWidth + "fawefefa";
    canvasElement.width = canvasholder.offsetWidth;
    canvasElement.height = canvasholder.offsetHeight;
	var rect = canvasElement.getBoundingClientRect();
	var g = globalJSON;

	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;

	for (var i = 0; i < g.mainObjects.length; i++) {
		
		if( (x >= g.mainObjects[i].startX - 4 && x <= g.mainObjects[i].endX + 4 ) && ( y >= g.mainObjects[i].startY - 4 && y <= g.mainObjects[i].endY + 4 ) ) {

			selectedElement = g.mainObjects[i].id;
			drawToCanvas(g);

			if( checkForDeleteClick(g.mainObjects[i], x, y) == true ) {

				deleteNode(g.mainObjects[i].id);
				return;
			}

			if( checkForEdgeDrawClick(g.mainObjects[i], g.mainObjects[i].id, x, y) == true ) {
				drawEdge(true);
				return;
			}

			for(var j = 0; j < g.mainObjects[i].objectsArray.length; j++) {

				if( (x >= g.mainObjects[i].objectsArray[j].startX && x <= g.mainObjects[i].objectsArray[j].endX ) && ( y >= g.mainObjects[i].objectsArray[j].startY && y <= g.mainObjects[i].objectsArray[j].endY ) ) {
					
					var n = g.mainObjects[i].objectsArray[j].name;
					var d = g.mainObjects[i].objectsArray[j].description;

					var st = "<b>" + n + "</b>";
					
					for(var p = 0; p < g.mainObjects[i].objectsArray[j].properties.length; p++) {
						st += "<br><b>" + g.mainObjects[i].objectsArray[j].properties[p].propertyName + " : </b>" + g.mainObjects[i].objectsArray[j].properties[p].propertyValue;
					}

					st += "<br>	<button onclick=editProperties()>Edit</button> <button onclick=closePopup()>Close</button>";

					var dispX = g.mainObjects[i].objectsArray[j].startX + ((g.mainObjects[i].objectsArray[j].endX - g.mainObjects[i].objectsArray[j].startX) / 2);

					editArray = [i, j, (dispX + rect.left), (g.mainObjects[i].objectsArray[j].startY + rect.top)];

					displayPopup(st, dispX + rect.left, g.mainObjects[i].objectsArray[j].startY + rect.top);
					return;

				}	

			}
			closePopup();
			return;
		}
	}

	closePopup();
	selectedElement = null;
	drawToCanvas(g);

}

function drop(e) {

	var rect = canvasElement.getBoundingClientRect();

	var ctx = canvasElement.getContext("2d");
	
	var src = localStorage.getItem("currentDragElement");
	
	var imgElement = new Image();
	imgElement.src = src;
	var w = imgElement.width;
	var h = imgElement.height;        

	imgElement.height = "75px";
	imgElement.width = parseInt((75 * w) / h) + "px";

	w = parseInt((75 * w) / (h));
	h = parseInt(75);

	var startX = e.clientX - rect.left - parseInt((75 * w) / (2*h));
	var startY = e.clientY - rect.top - parseInt(75/2);

	var endX = startX + w;
	var endY = startY + h;

	var index = checkifOverlapping(startX, startY, endX, endY);

	var activeWorkflowElement = JSON.parse(localStorage.getItem("activeWorkflowElement"));

	var dropoObject = {"id": "d"+(new Date()).getTime(), "name": "", "imageSource": "", "properties": [], "startX": startX, "startY": startY, "endX": endX, "endY": endY};

	for( var i = 0; i < activeWorkflowElement.elements.length; i++) {
		if( activeWorkflowElement.elements[i].imageSource == src ) {
			dropoObject.name = activeWorkflowElement.elements[i].elementName;
			dropoObject.imageSource = src;
			
			for (var j = 0; j < activeWorkflowElement.elements[i].properties.length; j++) {
				var value = null;

				if(activeWorkflowElement.elements[i].properties[j].propertyType == "Number") {
					value = 0
				} else if(activeWorkflowElement.elements[i].properties[j].propertyType == "Boolean") {
					value = "false";
				} else {
					value = "";
				}

				dropoObject.properties.push({"propertyName": activeWorkflowElement.elements[i].properties[j].propertyName, "propertyType": activeWorkflowElement.elements[i].properties[j].propertyType, "propertyValue": value});

			}
		}
	}
	

	var g = globalJSON;

	if( index == -1) {
		var mainObject = {"id": "m"+(new Date()).getTime(), "startX": (startX - 5), "startY": (startY - 17), "endX": (endX + 5), "endY": (endY + 5), objectsArray: [dropoObject]};
		g.mainObjects.push(mainObject);
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

	} else {

		dropoObject.startX = g.mainObjects[index].objectsArray[0].startX;
		dropoObject.startY = g.mainObjects[index].endY + 5;
		dropoObject.endX = g.mainObjects[index].objectsArray[0].startX + w;
		dropoObject.endY = g.mainObjects[index].endY + 5 + h;

		if( w > (g.mainObjects[index].endX - g.mainObjects[index].startX - 10) ) {
			g.mainObjects[index].endX = g.mainObjects[index].objectsArray[0].startX + w + 5;

		}

		g.mainObjects[index].endY = g.mainObjects[index].endY + h + 10;
		
		g.mainObjects[index].objectsArray.push(dropoObject);


		for( var k = 0; k < g.mainObjects[index].objectsArray.length; k++ ) {

			var difference = g.mainObjects[index].objectsArray[k].endX - g.mainObjects[index].objectsArray[k].startX;
			difference = (g.mainObjects[index].endX - g.mainObjects[index].startX - difference) / 2;
			
			var originalWidth = g.mainObjects[index].objectsArray[k].endX - g.mainObjects[index].objectsArray[k].startX;
			g.mainObjects[index].objectsArray[k].startX	 = g.mainObjects[index].startX + difference;
			g.mainObjects[index].objectsArray[k].endX = g.mainObjects[index].objectsArray[k].startX + originalWidth;

		}

		drawToCanvas(g);

		drawEdgeConnectors(g.mainObjects[index].startX, g.mainObjects[index].startY, g.mainObjects[index].endX, g.mainObjects[index].endY);
	}

	globalJSON = g;

	localStorage.setItem("globalJSON", JSON.stringify(g));

	importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

}

function populateWorkflowElementsDetail(workflowElementsDetail) {

	var populateWorkflowElementsDetailElement = Polymer.dom(assetAppElement.root).querySelector("#populateDetailsSection");
	populateWorkflowElementsDetailElement.innerHTML = workflowElementsDetail;

}

function checkifOverlapping(sx, sy, ex, ey) {

	try {

		globalJSON = globalJSON;

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
		importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

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
			importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
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
			importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
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
			importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
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
			importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

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
						importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
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