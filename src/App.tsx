import { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [errormsg, setErrormsg] = useState("");
  const API_KEY = import.meta.env.VITE_API_KEY;

  const callChatGPT = async () => {
    try {
      console.log("API_KEY - ", API_KEY);
      console.log("Prompt - ", prompt);

      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',  // Change to 'gpt-4' for GPT-4 model
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Result - ", result);
      setResponse(result.data.choices[0].message.content);

    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        console.error("Error response: ", error.response);
        setErrormsg(`Status: ${error.response.status} - ${error.response.data.error.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request: ", error.request);
        setErrormsg("Error: No response received from the server.");
      } else {
        // Something went wrong in setting up the request
        console.error("Error message: ", error.message);
        setErrormsg(`Error: ${error.message}`);
      }
    }
  };

  return (
    <>
      <div>
        <h1>Ask Me Anything</h1>
        <textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Enter your prompt"
        />
        <button onClick={callChatGPT}>Send</button>
        <div>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
        {errormsg && 
          <div>
            <h2>Error:</h2>
            <p>{errormsg}</p>
          </div>
        }
      </div>
    </>
  );
}

export default App;
