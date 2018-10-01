function updateJSONWithID(json) {
    try {

        if( "subcomponent_details" in json ) {
            console.log("JSON requires no upgrade");
            return json;
        }
        
        //Upgrade is needed.

        json["subcomponent_details"] = [];

        for(var i = 0; i < json.mainObjects.length; i++) {

            json["subcomponent_details"].push({"parentId" : json.mainObjects[i].id, "details": []});
            // Adding ID unique ID to each tool used and creating separate details for each tool used.
            for(var j = 0; j < json.mainObjects[i].toolsUsed.length; j++) {

                var detailsTemplate = newTemplate();
                json["subcomponent_details"][i]["details"].push(detailsTemplate);
            }
        }
        
        console.log("Successfully upgraded JSON");
        
        return json;
    } catch(err) {
        console.log("Could not upgrade JSON : " + err.message);
        return null;
    }

}