import time
import requests
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL")
AUDIO_PATH = "/home/carmella/audio" 

last_level = None
last_language = None

def play(file):
    os.system(f"mpg123 {AUDIO_PATH}/{file}")

while True:
    try:
        r = requests.get(BACKEND_URL, timeout=3)
        data = r.json()

        level = data["level"]
        language = data.get("language", "en")

        if level != last_level or language != last_language:
            print(f"New alert: {level}, language: {language}")

            if level == "RED":
                play("spanish_red_alert.mp3" if language == "es" else "red_alert.mp3")
            elif level == "YELLOW":
                play("spanish_yellow_alert.mp3" if language == "es" else "yellow_alert.mp3")

            last_level = level
            last_language = language

    except Exception as e:
        print("Backend not reachable, retrying...", e)

    time.sleep(60)  # fetch every minute
