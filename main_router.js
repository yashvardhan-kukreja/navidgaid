const router = require("express").Router();
const location_objs = require("./coordinates");
const middlewares = require("./middlewares");

const mqtt = require("mqtt");


const client  = mqtt.connect('mqtt://test.mosquitto.org')

    
client.on('connect', function () {
    client.subscribe("presence", function (err) {
        if (!err) {
            console.log("At least connected and subscribed");
        }
    }); 
  });



  

let latest_rssi_to_rssi_distances;
let latest_client_to_rssi_distances;
let latest_source_coordinates;
let latest_target_coordinates;
let latest_direction;
let latest_angle_offset;

router.post("/update-variables", (req, res) => {

    //console.log(req.body);

    client.publish('presence', 'something');

    client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString())
      })

    
//   client.on('message', function (topic, message) {
//     // message is Buffer
//     console.log(message.toString());
//   });



    let {text, rssi_to_rssi_distances, client_to_rssi_distances, compass} = req.body;

    latest_rssi_to_rssi_distances = rssi_to_rssi_distances;
    latest_client_to_rssi_distances = client_to_rssi_distances;

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
            length: (latest_rssi_to_rssi_distances["1-2"]+latest_rssi_to_rssi_distances["3-4"])/2,
            breadth: (latest_rssi_to_rssi_distances["1-3"]+latest_rssi_to_rssi_distances["2-4"])/2,
            direction: latest_direction,
            angle_offset: latest_angle_offset
        }
    });
});

module.exports = router;