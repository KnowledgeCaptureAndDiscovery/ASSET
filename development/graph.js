function deleteNode(id) {

	try {

		var g = globalJSON;
        var deletionFlag = false;
        var undoElement = [];
        selectedElement = null;
		for( var i = 0; i < g.mainObjects.length; i++ ) {

			if( g.mainObjects[i].id == id ) {

				undoElement.push(g.mainObjects.splice(i, 1)[0]);
                undoElement.push(g.details.splice(i,1)[0]);
                undoElement.push(g.subcomponent_details.splice(i, 1)[0]);
                i--;
                deletionFlag = true;
				break;
			}
		}

		for (var j = 0; j < g.edges.length; j++) {
			if( g.edges[j][0] == id || g.edges[j][1] == id ) {
				undoElement.push(g.edges.splice(j, 1)[0]);
				j--;
				deletionFlag = true;
			}
        }
        undoArray.push([1, undoElement]);
        redoArray = [];
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


function checkIfExists() {
    var edges = globalJSON.edges;
    for (var j = 0; j < edges.length; j++) {
        if( edges[j][0] == edge && edges[j][1] == selectedElement ) {
            //alert();
            return true;
        }
    }
    return false;
}

/*
    Uses depth first search algorithm

    Parent points to children

    3 sets: White Gray Black

    Black: is done: no more children
    White: is untouched
    Gray: is currently active

    1.Grab elements and put in White
    2.Get random element and put in gray
    3.Go through children of all the gray set
    4.If U get a child and it exists in the gray already then cycle exists
    5.If not u get the children and put them in gray set
    6.Put finished into black
    7.repeat 3 untill gray is empty
    8.repeat 2 until white is empty
    9.no cycle exists
    
    worst case performance : no cycle exists
*/
function checkIfCycleExists() {
    var whiteSet = new Set();
    var graySet = new Set();
    var blackSet = new Set();
    var objects = globalJSON.mainObjects;
    //1
    for (var i = 0; i < objects.length; i++) {
        whiteSet.add(objects[i].id);
    }

    while (whiteSet.size > 0) {
        //2
        var add = whiteSet.entries().next().value[0];
        if(dfs(add, whiteSet, graySet, blackSet)) {
            return true;
        }
        
    }
    return false;
}

function dfs (current, whiteSet, graySet, blackSet) {
    moveElement(current, whiteSet, graySet);
    var neighbors = getNeighbors(current);
    for (var i = 0; i < neighbors.length; i++) {
        if (blackSet.has(neighbors[i])) {
            continue;
        }

        if (graySet.has(neighbors[i])) {
            return true;
        }

        if (dfs(neighbors[i], whiteSet, graySet, blackSet)) {
            return true;
        }
    }

    moveElement(current, graySet, blackSet);
    return false;
}

function getNeighbors(current) {
    var neighbors = [];
    for (var i = 0; i < globalJSON.edges.length; i++) {
        if (globalJSON.edges[i][0] == current) {
            neighbors.push(globalJSON.edges[i][1]);
        }
    }
    return neighbors;
}

function moveElement(element, source, destination) {
    source.delete(element);
    destination.add(element);
}
