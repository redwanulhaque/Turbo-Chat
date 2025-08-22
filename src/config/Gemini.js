// Import necessary classes and enums from Google Generative AI SDK
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Define model name and API key
const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = import.meta.env.VITE_API_KEY;

// Main function to send prompt and receive AI-generated response
async function runChat(prompt) {
  console.log("🔵 Sending prompt:", prompt); // Log prompt being sent

  const genAI = new GoogleGenerativeAI(API_KEY); // Initialize API client
  const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Get model instance

  // Configuration for generation parameters
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  // Set safety settings to block harmful content
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  try {
    // Start a chat session with config and safety settings
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    // Send the prompt and wait for response
    const result = await chat.sendMessage(prompt);
    console.log("🟢 API Response:", result); // Log full response for debugging

    // Handle missing or invalid responses
    if (!result || !result.response) {
      console.error("🔴 No response from API");
      return "Error: No response from AI.";
    }

    // Extract and return the text content from the response
    const responseText = await result.response.text();
    console.log("🟢 Processed Response:", responseText); // Log processed response text

    return responseText;
  } catch (error) {
    // Catch and log any API errors
    console.error("🔴 API Call Error:", error);
    return "Error retrieving response.";
  }
}

// Export the runChat function for use in other files
export default runChat;
