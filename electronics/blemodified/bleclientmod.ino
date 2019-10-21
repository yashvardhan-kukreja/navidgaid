#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <SimpleKalmanFilter.h>

SimpleKalmanFilter simpleKalmanFilter(4, 4, 1);

int scanTime = 1; //In seconds
BLEScan* pBLEScan;
BLEAdvertisedDevice device;
BLEAddress *address;

int measuredrssi1 = 0;
int measuredrssi2 = 0;

void setup() {
  Serial.begin(115200);

  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); //create new scan
  pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);  // less or equal setInterval value
}

void loop() {
  BLEScanResults foundDevices = pBLEScan->start(scanTime);
  for(int i=0;i<foundDevices.getCount();i++){
    device = foundDevices.getDevice(i);
    address = new BLEAddress(device.getAddress());
    if(strcmp(address->toString().c_str(), "a4:cf:12:74:f9:c2") == 0){
//    Serial.print(device.toString().c_str());
      measuredrssi1 = device.getRSSI();
      float estimatedrssi1 = simpleKalmanFilter.updateEstimate(measuredrssi1);
      Serial.print(estimatedrssi1); 
      Serial.print(" ");
    }
    if(strcmp(address->toString().c_str(), "3c:71:bf:6a:48:6e") == 0){
//    Serial.print(device.toString().c_str());
      measuredrssi2 = device.getRSSI();
      float estimatedrssi2 = simpleKalmanFilter.updateEstimate(measuredrssi2);
      Serial.println(estimatedrssi2); 
//      Serial.println("2");
    }
  }
  pBLEScan->clearResults();   // delete results fromBLEScan buffer to release memory
  delay(1);
}
