"""Optional USB bridge: pip install pyserial; set ARDUINO_PORT and ARDUINO_BRIDGE_TOKEN."""
import json, os, time, urllib.request
import serial
port = os.environ['ARDUINO_PORT']
token = os.environ['ARDUINO_BRIDGE_TOKEN']
url = os.environ.get('SEANCE_URL', 'http://127.0.0.1:3001') + '/api/device'
while True:
    try:
        with serial.Serial(port, 9600, timeout=1) as device:
            time.sleep(2)
            while True:
                try:
                    request = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + token})
                    with urllib.request.urlopen(request, timeout=4) as response:
                        state = json.load(response)['state']
                    device.write((state + '\n').encode())
                except Exception:
                    device.write(b'Stopped\n')
                time.sleep(1)
    except (serial.SerialException, OSError):
        time.sleep(3)
