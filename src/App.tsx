import { useState } from "react";
import axios from "axios";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [errormsg, setErrormsg] = useState("");
  const API_KEY = import.meta.env.VITE_API_KEY;

  const callChatGPT = async () => {
    try {
      const result = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // Change to 'gpt-4' for GPT-4 model
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(result.data.choices[0].message.content);
      setErrormsg(""); // Clear any previous errors
    } catch (error: any) {
      if (error.response) {
        setErrormsg(
          `Status: ${error.response.status} - ${
            error.response.data.error.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        setErrormsg("Error: No response received from the server.");
      } else {
        setErrormsg(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          AI Chat Assistant
        </h1>
        <textarea
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me anything..."
          rows={5}
        ></textarea>
        <button
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          onClick={callChatGPT}
        >
          Send
        </button>
        <div className="mt-6">
          {response && (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg">
              <h2 className="font-semibold">Response:</h2>
              <p>{response}</p>
            </div>
          )}
          {errormsg && (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mt-4">
              <h2 className="font-semibold">Error:</h2>
              <p>{errormsg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
