module.exports.coordinate_calculator = (rssi_to_rssi_distances, client_to_rssi_distances) => {
    let e = (rssi_to_rssi_distances["1-2"] + rssi_to_rssi_distances["2-1"]+rssi_to_rssi_distances["3-4"] + rssi_to_rssi_distances["4-3"])/4;
    let a = client_to_rssi_distances["1"];
    let b = client_to_rssi_distances["2"];

    let x_coord = ((b*b)-(a*a)-(e*e))/(-2*e);

    let y_coord = Math.sqrt((a*a)-(x_coord*x_coord));

    return [x_coord, y_coord];
};