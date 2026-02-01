# 🚨 ClearAlert
**Offline-First Emergency Alerts for Vulnerable Communities**

ClearAlert is an **offline-resilient emergency alert system** designed to ensure people receive **clear, accessible, and personalized alerts** during extreme weather — even when internet connectivity fails.

Built for **ElleHacks 2026** under the theme **Tech for Equity & Social Good**.

---

## 🌍 Why ClearAlert
During emergencies, alerts often fail when they’re needed most:
- Internet and power outages disrupt notifications
- Alerts are unclear, text-heavy, or not in the user’s language
- Vulnerable communities (seniors, newcomers, students living alone, rural areas) are disproportionately affected

ClearAlert addresses this gap by delivering **multilingual audio alerts locally**, without relying on constant connectivity.

---

## ✨ What It Does

### 🌐 Web App (Online Mode)
- Users enter their **location**
- Select **preferred language**
- Add personal context (pets, vision impairment, medical needs, etc.)
- View **clear explanations + recommended actions**

### 🔊 Offline Alerts (Emergency Mode)
- A **Raspberry Pi 4** polls the system every **5 seconds**
- When an alert escalates (**SAFE → WARNING → EMERGENCY**), it plays a **multilingual audio alert locally**
- **Cached alerts** ensure instructions are still delivered if the internet goes down

---

## 🧠 Key Features
- Offline-first architecture
- Multilingual, accessible **audio alerts**
- Personalized emergency guidance
- Low-cost hardware deployment
- Designed for real-world failure conditions

---

## 🛠️ Tech Stack

### Frontend
- **TypeScript + React**
- Location-based input & personalization UI

### Backend
- **Python + Flask API**
- Alert logic & risk classification (**SAFE / WARNING / EMERGENCY**)

### Hardware
- **Raspberry Pi 4**
- Bluetooth speaker for local audio playback
- Local caching for offline resilience

### Generative AI
- **ElevenLabs** – multilingual, natural-sounding voice alerts (pre-generated & cached)
- **Google Gemini** – personalized emergency recommendations based on user context
  (medical needs, disabilities, household type)

---

## 🧩 System Architecture (High-Level)
Web App (React)
↓
Backend (Flask)
↓
Raspberry Pi (polls every 5s)
↓
Local Audio Playback (cached MP3s)

---

## 🏆 Accomplishments
- Built a fully functional **end-to-end prototype**
- Implemented **offline caching** for emergency reliability
- Delivered **personalized, multilingual audio alerts**
- Designed explicitly for vulnerable communities

---

## 🔮 What’s Next
- Integrate live weather APIs for real deployments
- Expand accessibility options (slower speech, visual indicators)
- Add SMS / mesh fallback communication
- Pilot with community organizations and real users

