/*
	From stack overflow simulates an event
*/
function eventFire(el, etype){
	if (el.fireEvent) {
	  el.fireEvent('on' + etype);
	} else {
	  var evObj = document.createEvent('Events');
	  evObj.initEvent(etype, true, false);
	  el.dispatchEvent(evObj);
	}
}

//called when button is pressed on canvas
function buttonPressed(e){
	deletePress(e);
}

//one of the functions when a key is pressed
function deletePress(e) {
	if (e.key === "Backspace" || e.key === "Delete") {
		if (selectedElement != null && !descriptionTable.focus) {
			deleteNode(selectedElement);
			saved = false;
			resetTable();
		}
	}
}

function onDoubleClick(e) {
    setTimeout(() => edge = selectedElement, 100);
    setTimeout(() => canvasClick(e), 100);
}

/* 
	called when mouse wheel in motion over the canvas

	e is mouse move event
*/
function mouseScrollingCanvas(e) { //REMMEBER TO IMPLEMEMNT CHANGINIG THE SLIDER AS WELL OR REMOVE EDITABLE
	if (e.deltaY > 0) { //scroll down
		if (currentScale < maxScale) { //if slider isnt at the highest point
			zoomOut();
		}
	} else {//scroll up
		if (currentScale > minScale) { //if slider isnt at the lowest point
			zoomIn();
		}
	}
	drawToCanvas(globalJSON);
}

/*
	Pretty minor function... Just prevents the browser from registering enter strokes when in the title
*/
function ignoreEnters(e) {
	if (e.key === "Enter") {
		e.preventDefault();
		title.blur();
		saveTitle(e);
	}
}