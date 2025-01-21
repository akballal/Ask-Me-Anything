import { useState } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [prompt, setPrompt] = useState("");
  const [errormsg, setErrormsg] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const API_KEY = import.meta.env.VITE_API_KEY;

  const callChatGPT = async () => {
    if (!prompt.trim()) return; // Avoid sending empty prompts
    const userMessage = { role: "user", content: prompt };
    setPrompt("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true); // Set loading state to true while waiting for the response

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
    setLoading(false); // Set loading state to false once the response is received
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
          {loading && (
            <div className="text-center">
            <div role="status">
                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
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
            disabled={loading} // Disable the send button when loading
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
