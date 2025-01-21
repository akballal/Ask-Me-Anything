import { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [prompt, setPrompt] = useState("");
  const [errormsg, setErrormsg] = useState("");
  const API_KEY = import.meta.env.VITE_API_KEY;

  const callChatGPT = async () => {
    if (!prompt.trim()) return; // Avoid sending empty prompts
    const userMessage = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // Change to 'gpt-4' for GPT-4 model
          messages: [...messages, userMessage],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const rawResponse = result.data.choices[0].message.content;

      // Compile response into a formatted version
      const formattedResponse = compileResponse(rawResponse);

      const assistantMessage = {
        role: "assistant",
        content: formattedResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
    setPrompt(""); // Clear input field after sending
  };

  // Helper function to format and compile the response
  const compileResponse = (rawResponse: string) => {
    const lines = rawResponse.split("\n").filter((line) => line.trim() !== "");
  
    const formattedLines = lines.map((line) => {
      // Replace markdown-style bold syntax (**text**) with <strong>text</strong>
      const boldFormattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
      if (line.match(/^\d+\./)) {
        // Wrap numbered points in a list item
        return `<li>${boldFormattedLine.trim()}</li>`;
      } else if (line.startsWith("*") || line.startsWith("-")) {
        // Handle bullet points
        return `<li>${boldFormattedLine.replace(/^(\*|-)/, "").trim()}</li>`;
      } else {
        // Wrap other text in a paragraph
        return `<p>${boldFormattedLine.trim()}</p>`;
      }
    });
  
    // Wrap all lines in a <ul> if they are list items, else return as-is
    return `<ul>${formattedLines.join("")}</ul>`;
  };
  

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold text-gray-800 p-4 text-center border-b">
          Ask Me Anything
        </h1>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-[70%] ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                dangerouslySetInnerHTML={{
                  __html: message.content,
                }}
              ></div>
            </div>
          ))}
          {errormsg && (
            <div className="text-red-800 p-4 bg-red-100 rounded-lg">
              <h2 className="font-semibold">Error:</h2>
              <p>{errormsg}</p>
            </div>
          )}
        </div>
        <div className="border-t p-4 flex gap-2">
          <textarea
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            rows={1}
          ></textarea>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={callChatGPT}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
