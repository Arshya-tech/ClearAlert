from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# -----------------------
# Example environmental state
# -----------------------
state = {
    "temperature": 22,
    "wind": 10,
    "rain": 0,
    "heat_index": 22,
    "alert_level": "GREEN",
    "language": "en",
    "last_updated": None
}

#Risk level logic 
def compute_alert(state):
    if state["heat_index"] >= 40 or state["wind"] >= 80:
        return "RED"
    elif state["heat_index"] >= 32 or state["rain"] >= 30:
        return "YELLOW"
    else:
        return "GREEN"

# -----------------------
# control endpoint
# -----------------------
@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.json
    state["temperature"] = data.get("temperature", state["temperature"])
    state["wind"] = data.get("wind", state["wind"])
    state["rain"] = data.get("rain", state["rain"])
    state["heat_index"] = data.get("heat_index", state["heat_index"])
    state["language"] = data.get("language", state["language"])

    state["alert_level"] = compute_alert(state)
    state["last_updated"] = datetime.utcnow().isoformat()

    return jsonify({
        "status": "updated",
        "state": state
    })

# -----------------------
# Pi + frontend polling
# -----------------------
@app.route("/alert", methods=["GET"])
def alert():
    return jsonify({
        "level": state["alert_level"],
        "language": state["language"],
        "last_updated": state["last_updated"]
    })

# -----------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
