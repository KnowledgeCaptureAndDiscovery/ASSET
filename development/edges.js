/*
    Directional value in relation to obj1

    obj1 and obj2 are two elements
    _________________________________________________
    |                  \         /                  |
    |                   \   N   /                   |
    |                    \     /                    |
    |                     \   /                     |
    |     W                 *             E         |
    |                     /    \                    |
    |                    /      \                   |
    |                   /   S    \                  |
    |                  /          \                 |
    |_______________________________________________|

    returns N E S W or null

    canvas coordinates go from left to right from up to down
*/
function findDirection (obj1, obj2) {
    if(obj1===null || obj2 ===null) {
        return null;
    }

    var center1 = [(obj1.endX + obj1.startX)/2, (obj1.endY + obj1.startY)/2];
    var center2 = [(obj2.endX + obj2.startX)/2, (obj2.endY + obj2.startY)/2];

    var displacement = [center2[0] - center1[0], center2[1] - center1[1]];

    //console.log(displacement[0]);
    //console.log(displacement[1]);
    if (displacement[0] > 0) { // if east of
        if (displacement[1] > 0) { //if south of
            if(displacement[0] - displacement[1] > 0) { //if more east than south
                return "E";
            } else { // if more South than east
                return "S"; 
            }
        } else { //if north of
            if(displacement[0] + displacement[1] > 0) {
                return "E";
            } else {
                return "N";
            }
        }
    } else { //if west of
        if (displacement[1] > 0) { //if north of
            if(displacement[0] + displacement[1] < 0) {
                return "W";
            } else {
                return "S";
            }
        } else {
            if (displacement[0] - displacement[1] < 0) {
                return "W";
            } else {
                return "N";
            }
        }
    }
}


/*
    Draws a line from (x1, y1) to (x2, y2)
*/
function drawLine (x1 , y1 , x2, y2, ctx) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/*
    What this function does is it autoumatically finds the  best side the edge should be on

    first we determine the best sides the edge should connect

    second we draw out the edge with the arrows
*/
function drawEdge(obj1, obj2) {
    var ctx = canvasElement.getContext('2d');
    
    //first step using the findDirection function
    var direction = findDirection(obj1, obj2); //get direction of obj2 relative to obj1
    var toSide; //what side of obj2 the arrow is pointing towards, basically oppside of direction
    if (direction === "N") {
        toSide = "S";
    } else if (direction === "S") {
        toSide = "N";
    } else if (direction === "E") {
        toSide = "W";
    } else if (direction === "W") {
        toSide = "E";
    } else {
        return;
    }
    var coordsFrom = getCoords (obj1, direction); //coords from obj1
    var coordsTo = getCoords(obj2, toSide);//coords to obj2

    //step 2

    var arrowPath = new Path2D();
    if( toSide == "W" ) {
        drawLine (coordsFrom.x / currentScale, coordsFrom.y / currentScale, (coordsTo.x - 10) / currentScale, coordsTo.y / currentScale, ctx);
        arrowPath.moveTo(coordsTo.x/currentScale, coordsTo.y/currentScale);
        arrowPath.lineTo((coordsTo.x - 10)/currentScale, (coordsTo.y - 10)/currentScale);
        arrowPath.lineTo((coordsTo.x - 10)/currentScale, (coordsTo.y + 10)/currentScale);
    } else if( toSide == "N" ) {
        drawLine (coordsFrom.x / currentScale, coordsFrom.y / currentScale, (coordsTo.x) / currentScale, (coordsTo.y - 10) / currentScale, ctx);
        arrowPath.moveTo(coordsTo.x/currentScale, coordsTo.y/currentScale);
        arrowPath.lineTo((coordsTo.x - 10)/currentScale, (coordsTo.y - 10)/currentScale);
        arrowPath.lineTo((coordsTo.x + 10)/currentScale, (coordsTo.y - 10)/currentScale);
    }  else if( toSide == "E" ) {
        drawLine (coordsFrom.x / currentScale, coordsFrom.y / currentScale, (coordsTo.x + 10) / currentScale, coordsTo.y / currentScale, ctx);
        arrowPath.moveTo(coordsTo.x/currentScale, coordsTo.y/currentScale);
        arrowPath.lineTo((coordsTo.x + 10)/currentScale, (coordsTo.y - 10)/currentScale);
        arrowPath.lineTo((coordsTo.x + 10)/currentScale, (coordsTo.y + 10)/currentScale);
    } else { //south
        drawLine (coordsFrom.x / currentScale, coordsFrom.y / currentScale, (coordsTo.x) / currentScale, (coordsTo.y + 10) / currentScale, ctx);
        arrowPath.moveTo(coordsTo.x/currentScale, coordsTo.y/currentScale);
        arrowPath.lineTo((coordsTo.x - 10)/currentScale, (coordsTo.y + 10)/currentScale);
        arrowPath.lineTo((coordsTo.x + 10)/currentScale, (coordsTo.y + 10)/currentScale);
    }
    ctx.fill(arrowPath);
}

/*
    gets the coordinates of element's direction
*/
function getCoords (obj, direction) {
    var coords = {"x" : "", "y" : ""};
    if (direction === "N") {
        coords.x = (obj.startX + obj.endX) / 2;
        coords.y = (obj.startY);
    } else if (direction === "S") {
        coords.x = (obj.startX + obj.endX) / 2;
        coords.y = (obj.endY);
    } else if (direction === "E") {
        coords.x = obj.endX;
        coords.y = (obj.startY + obj.endY) / 2;
    } else if (direction === "W") {
        coords.x = obj.startX;
        coords.y = (obj.startY + obj.endY) / 2;
    } else {
        return;
    }
    return coords;
}