# Groq Whisper Transcription UI

[![React](https://img.shields.io/badge/React-gray?logo=react)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-gray?logo=typescript)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-gray?logo=vite)](https://vitejs.dev/) [![Groq](https://img.shields.io/badge/Groq-API-orange)](https://groq.com/)

A simple web interface built with React, TypeScript, and Vite to perform fast audio transcriptions using OpenAI's Whisper model hosted on the Groq Cloud API.

<!-- Optional: Add a screenshot or GIF demo here -->
<!-- ![Screenshot of Groq Whisper UI](link/to/your/screenshot.png) -->

## Features

- Upload audio files for transcription.
- Utilizes the Groq API for near real-time Whisper transcription.
- Displays the transcription results clearly.
- Built with modern frontend technologies (React, Vite, TypeScript).

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **API:** [Groq Cloud](https://console.groq.com/docs/models) (for Whisper model inference)
- **Styling:** Tailwind, Shadcn/ui

## Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm
- A Groq Cloud API Key (Get one from [GroqCloud](https://console.groq.com/keys))

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/T1ckbase/groq-whisper.git
    cd groq-whisper
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

## Running the Development Server

1.  **Start the Vite development server:**

    ```bash
    pnpm dev
    ```

2.  Open your browser and navigate to `http://localhost:5173` (or the port specified in the console output).

## Building for Production

1.  **Build the application:**

    ```bash
    pnpm build
    ```

    This will create a `dist` folder with the optimized production build.

2.  **Preview the production build locally (optional):**
    ```bash
    pnpm preview
    ```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request. (Add more specific contribution guidelines if desired).

## License

MIT
