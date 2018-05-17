
var sourceJSON = null;
var importAnchorElement;
var assetAppElement;
var popupElement;
var popupContainerElement;
var canvasElement;
var editArray;

var globalJSON = {
	"mainObjects": [],
	 "edges": []
};

initialize();

function initialize() {
	localStorage.setItem("globalJSON", JSON.stringify(globalJSON));

	assetAppElement = Polymer.dom(this.root).querySelector("asset-app");

	importAnchorElement = Polymer.dom(assetAppElement.root).querySelector("#exportAnchor");
	importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));
	importAnchorElement.setAttribute("download", "Workflow.json");

	popupElement = Polymer.dom(assetAppElement.root).querySelector("#popup");
	popupContainerElement = Polymer.dom(assetAppElement.root).querySelector("#popupContainer");

	canvasElement = Polymer.dom(assetAppElement.root).querySelector("#workflowSketchCanvas");
}

function displayPopup(popupText, clientX, clientY) {
	try {
		popupElement.style.visibility = "visible";
		popupElement.innerHTML = popupText;

		popupContainerElement.style.left = clientX + "px";
		popupContainerElement.style.top = clientY + "px";
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
	
	var rect = canvasElement.getBoundingClientRect();
	var g = JSON.parse(localStorage.getItem("globalJSON"));

	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;

	for (var i = 0; i < g.mainObjects.length; i++) {
		
		if( (x >= parseInt(g.mainObjects[i].startX) && x <= parseInt(g.mainObjects[i].endX) ) && ( y >= parseInt(g.mainObjects[i].startY) && y <= parseInt(g.mainObjects[i].endY) ) ) {

			for(var j = 0; j < g.mainObjects[i].objectsArray.length; j++) {

				if( (x >= g.mainObjects[i].objectsArray[j].startX && x <= g.mainObjects[i].objectsArray[j].endX ) && ( y >= g.mainObjects[i].objectsArray[j].startY && y <= g.mainObjects[i].objectsArray[j].endY ) ) {
					
					var n = g.mainObjects[i].objectsArray[j].name;
					var d = g.mainObjects[i].objectsArray[j].description;

					var st = "<b>" + n + "</b>";
					console.log(g.mainObjects[i].objectsArray[j]);
					for(var p = 0; p < g.mainObjects[i].objectsArray[j].properties.length; p++) {
						st += "<br><b>" + g.mainObjects[i].objectsArray[j].properties[p].propertyName + " : </b>" + g.mainObjects[i].objectsArray[j].properties[p].propertyValue;
					}

					st += "<br>	<button onclick=editProperties()>Edit</button> <button onclick='closePopup()'>Close</button>";

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
					value = "*";
				}

				dropoObject.properties.push({"propertyName": activeWorkflowElement.elements[i].properties[j].propertyName, "propertyType": activeWorkflowElement.elements[i].properties[j].propertyType, "propertyValue": value});

			}
		}
	}
	

	var g = JSON.parse(localStorage.getItem("globalJSON"));

	if( index == -1) {
		var mainObject = {"id": "m"+(new Date()).getTime(), "startX": (startX - 5), "startY": (startY - 5), "endX": (endX + 5), "endY": (endY + 5), objectsArray: [dropoObject]};
		g.mainObjects.push(mainObject);
		ctx.drawImage(imgElement ,startX, startY, w, h);

		ctx.beginPath();
		ctx.strokeStyle="black";
		ctx.rect(mainObject.startX, mainObject.startY, mainObject.endX - mainObject.startX, mainObject.endY - mainObject.startY);
		ctx.stroke();

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

		ctx.drawImage(imgElement, dropoObject.startX, dropoObject.startY, w, h);

		drawToCanvas(g);
	}

	localStorage.setItem("globalJSON", JSON.stringify(g));

	importAnchorElement.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("globalJSON")));

}

function populateWorkflowElementsDetail(workflowElementsDetail) {

	var populateWorkflowElementsDetailElement = Polymer.dom(assetAppElement.root).querySelector("#populateDetailsSection");
	populateWorkflowElementsDetailElement.innerHTML = workflowElementsDetail;

}

function checkifOverlapping(sx, sy, ex, ey) {

	try {

		globalJSON = JSON.parse(localStorage.getItem("globalJSON"));

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

		var g = JSON.parse(localStorage.getItem("globalJSON"));
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
		var g = JSON.parse(localStorage.getItem("globalJSON"));

		for (var i = 0; i < g.mainObjects[editArray[0]].objectsArray[editArray[1]].properties.length; i++) {
			var property = g.mainObjects[editArray[0]].objectsArray[editArray[1]].properties[i].propertyName;
			var value = Polymer.dom(assetAppElement.root).querySelector("#" + property).value;
			g.mainObjects[editArray[0]].objectsArray[editArray[1]].properties[i].propertyValue = value;
		}

		localStorage.setItem("globalJSON", JSON.stringify(g));

		closePopup();
	} catch(err) {
		alert("Failed to submit : " + err.message);
	}
}

function drawToCanvas(js) {

	try {
		
		var ctx = canvasElement.getContext('2d');

		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

		for(var i = 0; i < js.mainObjects.length; i++) {

			var mainObject = js.mainObjects[i];

			ctx.beginPath();
			ctx.strokeStyle="green";
			ctx.rect(mainObject.startX, mainObject.startY, mainObject.endX - mainObject.startX, mainObject.endY - mainObject.startY);
			ctx.stroke();

			for(var j = 0; j < mainObject.objectsArray.length; j++) {

				var element = mainObject.objectsArray[j];

				var imgElement = new Image();
				imgElement.src = element.imageSource;

				ctx.drawImage(imgElement, element.startX, element.startY, element.endX - element.startX, element.endY - element.startY);

				ctx.beginPath();
				ctx.strokeStyle="green";
				ctx.moveTo(mainObject.startX, element.endY + 5);
				ctx.lineTo(mainObject.endX, element.endY + 5);
				ctx.stroke();

			}

		}


	} catch(err) {
	 	console.log("Could not draw onto canvas : " + err.message);
	}

}