const mqtt = require("mqtt");
const router = require("express").Router();
const location_objs = require("./coordinates");
const middlewares = require("./middlewares");


const client  = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
    client.subscribe("presence", function (err) {
        if (!err) {
            console.log("At least connected and subscribed");
        }
    }); 
  });

let latest_rssi_to_rssi_distances = {};
let latest_client_to_rssi_distances = {};
let latest_source_coordinates = [];
let latest_target_coordinates = [];
let latest_direction;
let latest_angle_offset;

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////              CHANGE KAR ISSE BC 
//////////////////////////////////////

latest_rssi_to_rssi_distances["1-2"] = 0;
latest_rssi_to_rssi_distances["1-4"] = 0;
latest_rssi_to_rssi_distances["2-3"] = 0;
latest_rssi_to_rssi_distances["2-1"] = 0;
latest_rssi_to_rssi_distances["3-4"] = 0;
latest_rssi_to_rssi_distances["3-2"] = 0;
latest_rssi_to_rssi_distances["4-1"] = 0;
latest_rssi_to_rssi_distances["4-3"] = 0;

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////


router.post("/update-variables", (req, res) => {

    var rssi1 = middlewares.distance_extractor(req.body.rssi1);
    var rssi2 = middlewares.distance_extractor(req.body.rssi2);
    var rssi3 = middlewares.distance_extractor(req.body.rssi3);
    var rssi4 = middlewares.distance_extractor(req.body.rssi4);
    var rssi12 = middlewares.distance_extractor(parseInt(req.body.wrt1.substring(15,18),10));
    var rssi14 = middlewares.distance_extractor(parseInt(req.body.wrt1.substring(19,22),10));
    var rssi23 = middlewares.distance_extractor(parseInt(req.body.wrt2.substring(15,18),10));
    var rssi21 = middlewares.distance_extractor(parseInt(req.body.wrt2.substring(19,22),10));
    var rssi34 = middlewares.distance_extractor(parseInt(req.body.wrt3.substring(15,18),10));
    var rssi32 = middlewares.distance_extractor(parseInt(req.body.wrt3.substring(19,22),10));
    var rssi41 = middlewares.distance_extractor(parseInt(req.body.wrt4.substring(15,18),10));
    var rssi43 = middlewares.distance_extractor(parseInt(req.body.wrt4.substring(19,22),10));

    latest_rssi_to_rssi_distances["1-2"] = rssi12 || latest_rssi_to_rssi_distances["1-2"];
    latest_rssi_to_rssi_distances["1-4"] = rssi14 || latest_rssi_to_rssi_distances["1-4"];
    latest_rssi_to_rssi_distances["2-3"] = rssi23 || latest_rssi_to_rssi_distances["2-3"];
    latest_rssi_to_rssi_distances["2-1"] = rssi21 || latest_rssi_to_rssi_distances["2-1"];
    latest_rssi_to_rssi_distances["3-4"] = rssi34 || latest_rssi_to_rssi_distances["3-4"];
    latest_rssi_to_rssi_distances["3-2"] = rssi32 || latest_rssi_to_rssi_distances["3-2"];
    latest_rssi_to_rssi_distances["4-1"] = rssi41 || latest_rssi_to_rssi_distances["4-1"];
    latest_rssi_to_rssi_distances["4-3"] = rssi43 || latest_rssi_to_rssi_distances["4-3"];
    
    latest_client_to_rssi_distances["1"] = rssi1 || latest_client_to_rssi_distances["1"];
    latest_client_to_rssi_distances["2"] = rssi2 || latest_client_to_rssi_distances["2"];
    latest_client_to_rssi_distances["3"] = rssi3 || latest_client_to_rssi_distances["3"];
    latest_client_to_rssi_distances["4"] = rssi4 || latest_client_to_rssi_distances["4"];
    

    words = text.split(" ");
    let locations = Object.keys(location_objs);
    let final_point = "";
    for (let word of words) {
        if (locations.indexOf(word) >= 0) {
            final_point = word;
            break;
        }
    }

    // {
    //     "text": "Take me to the bathroom",
    //     "rssi_to_rssi_distances": {
    //         "1-2": 3.1232,   // upper length
    //         "2-1": 3.1232,  // upper length

    //         "1-3": 2.5434,   // left breadth
    //         "3-1": 2.5434,   // left breadth

    //         "3-4": 3.1232,   // lower length
    //         "4-3": 3.1232,   // lower length

    //         "2-4": 2.5434,   // right breadth
    //         "4-2": 2.5434

    //     },
    //     "client_to_rssi_distances": {
    //         "1": 1.5432,    // distance of the client (diagonal) from host 1
    //         "2": 1.76543,   // distance of the client (diagonal) from host 2
    //         "3": 0.123432,  // distance of the client (diagonal) from host 3
    //         "4": 2.232      // distance of the client (diagonal) from host 4
    //     },
    //     "compass": 90
    // }

    let target_coordinates = location_objs[final_point];
    latest_target_coordinates = target_coordinates;

    let source_coordinates = middlewares.coordinate_calculator(latest_rssi_to_rssi_distances, latest_client_to_rssi_distances);
    latest_source_coordinates = source_coordinates;

    let source_x = latest_source_coordinates[0];
    let source_y = latest_source_coordinates[1];

    let target_x = target_coordinates[0];
    let target_y = target_coordinates[1];
    
    let theta1 = 90-compass;    // Slope of user's line of eye sight / head
    let theta2 = (180/Math.PI)*Math.atan((target_y-source_y)/(target_x-source_x));  //slope of line user<->target
    let offset = theta1 - theta2;
    let direction = "right";
    if (offset < 0) {
        offset = -angle_diff;
        direction = "left";
    }
    latest_angle_offset = offset;
    latest_direction = direction;
    res.json({
        success: true,
        message: "Computed and updated the direction successfully",
        payload: {
            direction: latest_direction,
            angle_offset: latest_angle_offset
        }
    });
});

router.get("/coordinates", (req, res) => {
    res.json({
        success: true,
        message: "Length of the sides and coordinates of the user generated",
        payload: {
            user_location: latest_source_coordinates, // [1.22323, 2.12323]
            target_location: latest_target_coordinates,
            length: (latest_rssi_to_rssi_distances["1-2"]+latest_rssi_to_rssi_distances["4-3"])/2,
            breadth: (latest_rssi_to_rssi_distances["1-4"]+latest_rssi_to_rssi_distances["2-3"])/2,
            direction: latest_direction,
            angle_offset: latest_angle_offset
        }
    });
});

module.exports = router;