<div align="center">

<img width="292" height="101" alt="image" src="https://github.com/user-attachments/assets/841aedf5-363c-4f1f-8a75-57bc02a44318" />



### AI-powered music recommendation engine that understands your mood, activity, location, and weather to generate adaptive real-time playlists.

<br/>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-0F172A?style=for-the-badge&logo=typescript&logoColor=3178C6)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Machine Learning](https://img.shields.io/badge/Machine_Learning-111827?style=for-the-badge&logo=python&logoColor=yellow)
![YouTube Music](https://img.shields.io/badge/YouTube_Music-FF0000?style=for-the-badge&logo=youtube-music&logoColor=white)

</div>

---

## 📌 About The Project

**VibeMusic** is an AI-based music recommendation web application that generates music according to the user's real-time context.

The app detects or takes input from:

- 📍 User location  
- 🌦️ Current weather  
- 🙂 User mood from image/camera scan  
- 🏃 Current activity  
- 🌐 Preferred music language  

Based on these signals, VibeMusic creates a personalized music vibe and recommends songs that match the user's current environment and emotional state.

This project was developed in **two different approaches**:

1. **Google AI Studio / Gemini API based recommendation**
2. **Custom Machine Learning model trained using a Kaggle dataset**

The goal of this project is to understand how real-world recommendation engines can combine AI, weather data, mood detection, and user activity to generate smarter music experiences.

---

## 🖼️ Project Preview
---

### VibeMusic Web App UI

<img width="1845" height="1197" alt="image" src="https://github.com/user-attachments/assets/74d74753-d526-416b-b562-7883c53aa8a4" />


---

## 🚀 Features

- 🎵 AI-powered music recommendation
- 📸 Mood detection using user image/camera scan
- 📍 Location-based context detection
- 🌦️ Weather-aware music generation
- 🏃 Activity-based playlist recommendation
- 🌐 Multi-language music preference
- 🤖 Gemini API integration
- 🧠 Custom ML model approach using Kaggle dataset
- ⚡ Fast Vite + React frontend
- 🎨 Modern dark neon UI
- 🎧 YouTube Music discovery support

---

## 🧠 How It Works

VibeMusic generates recommendations by combining multiple user-context signals.

```mermaid
flowchart TD
    A[User Opens VibeMusic] --> B[Detect Location]
    A --> C[Scan Mood From Image]
    A --> D[Select Activity]
    A --> E[Select Music Language]

    B --> F[Fetch Weather Data]
    C --> G[Analyze Mood]
    D --> H[Understand User Activity]
    E --> I[Set Language Preference]

    F --> J[Generate Music Context]
    G --> J
    H --> J
    I --> J

    J --> K[AI / ML Recommendation Engine]
    K --> L[Generate Vibe Mix]
    L --> M[Play Recommended Music]

```
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hO8awO9ExuJSuooAv0gAC4V2U0pGJI9q

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
