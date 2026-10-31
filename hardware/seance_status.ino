const int LED = LED_BUILTIN;
String state = "Stopped";
String incoming = "";
unsigned long lastMessage = 0;
void setup() { pinMode(LED, OUTPUT); Serial.begin(9600); }
void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') { state = incoming; incoming = ""; lastMessage = millis(); }
    else if (incoming.length() < 32) incoming += c;
  }
  if (millis() - lastMessage > 6000) state = "Stopped";
  unsigned long t = millis();
  bool on = false;
  if (state == "Waiting") on = t % 1800 < 900;
  else if (state == "Running") on = t % 300 < 150;
  else if (state == "Completed") on = true;
  else if (state == "Failed") { unsigned long p = t % 2000; on = p < 600 && p % 200 < 100; }
  digitalWrite(LED, on ? HIGH : LOW);
}
