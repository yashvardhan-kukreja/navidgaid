#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

BLEAdvertisementData advert;
BLEAdvertising *pAdvertising;

int i = 0;

//manufacturer code (0x02E5 for Espressif)
int man_code = 0x02E5;

String str[10] = {"Hello", "Darkness", "My", "Old", "Friend"};

//function takes String and adds manufacturer code at the beginning 
void setManData(String c, int c_size, BLEAdvertisementData &adv, int m_code) {
  
  String s;
  char b2 = (char)(m_code >> 8);
  m_code <<= 8;
  char b1 = (char)(m_code >> 8);
  s.concat(b1);
  s.concat(b2);
  s.concat(c);

  
  adv.setManufacturerData(s.c_str());
  
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE work!");

  BLEDevice::init("MyESP32");
  BLEServer *pServer = BLEDevice::createServer();

  pAdvertising = pServer->getAdvertising();
  advert.setName("ESP32-new");
  pAdvertising->setAdvertisementData(advert);
  pAdvertising->start();
}

void loop() {

  BLEAdvertisementData scan_response;
  
  setManData(str[i], str[i].length() , scan_response, man_code);

  pAdvertising->stop();
  pAdvertising->setScanResponseData(scan_response);
  pAdvertising->start();
  
  i++;
  if(i > 4) {
    i = 0;
  }
  
  delay(100);
}
