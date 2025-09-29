
# AI Image Captioning & Segmentation

This project is an advanced web application that leverages the power of the Google Gemini AI to provide detailed analysis of user-uploaded images. Users can select a specific region of an image to receive an AI-generated descriptive caption and an instance segmentation mask of the primary object within that region.

The application also includes accessibility features like caption translation and text-to-speech, and allows users to download a comprehensive visual report of the analysis.

![Screenshot of the application interface analyzing a city street](https://i.imgur.com/kS9QW5z.png)

---

## ✨ Features

-   **Flexible Image Input**: Upload images via drag-and-drop, file selection, or capture a photo directly from your webcam.
-   **Interactive Region Selection**: Easily draw a bounding box on the image to select the object you want to analyze.
-   **AI-Powered Captioning**: Generates a detailed, context-aware caption for the object within the selected region using the `gemini-2.5-flash` model.
-   **AI-Powered Segmentation**: Extracts the selected object from its background, providing a clean segmentation mask on a transparent background using the `gemini-2.5-flash-image-preview` model.
-   **Multi-language Translation**: Translate the generated caption into multiple languages (Spanish, French, Hindi) to improve accessibility.
-   **Text-to-Speech**: Listen to the original and translated captions with a single click.
-   **Downloadable Reports**: Generate and download a single PNG report that includes the original image with the selection, the segmented object, and the full caption text.
-   **Responsive Design**: A clean, modern, and fully responsive UI built with Tailwind CSS.

---

## 🖼️ Application in Action

Here's a look at the application analyzing two different types of images:

**1. Analyzing a Natural Scene**

A user has selected a dog on a beach. The AI generates a rich, descriptive caption and perfectly segments the dog from its sandy background. The user can then translate the caption or listen to it via text-to-speech.



**2. Analyzing a Complex Urban Environment**

The application successfully identifies and describes architectural details within a busy city street, segmenting the selected buildings for closer inspection. This demonstrates the model's ability to handle complex scenes with many objects.



---

## 🚀 How It Works

The application follows a simple yet powerful workflow:

1.  **Image Upload**: The user provides an image. The app creates a local object URL to display it immediately.
2.  **Region Selection**: The user draws a rectangle on the image. The coordinates of this box are captured.
3.  **API Request**: When the user finishes drawing the box, the app sends two parallel requests to the Google Gemini API:
    -   **Captioning Request**: The full image, along with the bounding box coordinates and a text prompt, is sent to the `gemini-2.5-flash` model to generate a descriptive caption.
    -   **Segmentation Request**: The image, coordinates, and a different prompt are sent to the multimodal `gemini-2.5-flash-image-preview` model, which returns a new image containing only the segmented object on a transparent background.
4.  **Display Results**: The generated caption and segmented image are displayed in the results panel.
5.  **Enhancements**: The user can then interact with the results by translating the caption or using the text-to-speech feature.
6.  **Report Generation**: The "Download Report" feature uses the HTML Canvas API to dynamically compose the original image, segmentation result, and text into a single, shareable image file.

---

## 🛠️ Technology Stack

-   **Frontend**: React, TypeScript
-   **Styling**: Tailwind CSS
-   **AI**: Google Gemini API (`@google/genai`)
    -   `gemini-2.5-flash` for text and caption generation.
    -   `gemini-2.5-flash-image-preview` for image segmentation.
-   **Web APIs**: Fetch API, Web Speech API (SpeechSynthesis), Canvas API, MediaDevices API (getUserMedia).

---

## ⚙️ Setup and Running Locally

To run this project locally, you will need a Google Gemini API key.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Set up your API Key:**
    The application is configured to read the API key from an environment variable named `API_KEY`. You will need to make this variable available to your local development server. A common way to do this is by creating a `.env` file in the root of the project, though this project doesn't ship with a dev server that reads it automatically.

    **Important**: The application code (`services/geminiService.ts`) expects `process.env.API_KEY` to be present. You must ensure your local server setup injects this variable.

3.  **Serve the application:**
    Since this is a static project with no build step, you can use any simple local web server.

    **Example using Node.js `live-server`:**
    ```bash
    npm install -g live-server
    live-server
    ```

    **Example using Python:**
    ```bash
    # For Python 3
    python -m http.server
    ```
    
    After starting the server, open your browser and navigate to the provided local address (e.g., `http://localhost:8080`).

---

## 📁 File Structure

The project is organized into logical components and services:

```
/
├── components/         # Reusable React components
│   ├── Header.tsx
│   ├── icons.tsx
│   ├── ImageUploader.tsx
│   ├── InteractiveImage.tsx
│   ├── ResultDisplay.tsx
│   ├── Spinner.tsx
│   └── WebcamCapture.tsx
│
├── services/           # Logic for interacting with external APIs
│   └── geminiService.ts  # Contains all calls to the Gemini API
│
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component and state management
├── index.html          # Entry point of the application
├── index.tsx           # React root renderer
└── metadata.json       # Application metadata
└── README.md           # This file
```
