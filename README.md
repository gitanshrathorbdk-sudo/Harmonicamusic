# Harmonica Music App

This is a Next.js application for managing and playing your personal music library, with AI-powered playlist generation. This project was built in Firebase Studio.

## Getting Started

To run this project on your local machine, you'll need to have [Node.js](https://nodejs.org/) (version 18 or later) and [npm](https://www.npmjs.com/) installed.

### 1. Download the Code

Download the project source code as a ZIP file from Firebase Studio.

### 2. Install Dependencies

Navigate to the project's root directory in your terminal and install the necessary packages:

```bash
npm install
```

### 3. Set Up Environment Variables

This project uses Genkit for its AI features, which requires an API key for the Google AI models.

1.  Create a new file named `.env` in the root of your project.
2.  Add your API key to the file like this:

```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the Development Server

Once the installation is complete and your environment variables are set, you can start the development server:

```bash
npm run dev
```

This will start the application, and you can view it in your browser at [http://localhost:9002](http://localhost:9002).

### 5. Start the Genkit AI Server (Optional)

To see detailed logs and inspect your AI flows, you can run the Genkit development server in a separate terminal:

```bash
npm run genkit:watch
```

This will start the Genkit inspection UI, typically available at [http://localhost:4000](http://localhost:4000).
