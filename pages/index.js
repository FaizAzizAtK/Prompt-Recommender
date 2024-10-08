// import { useState, useEffect } from 'react';

// export default function Page() {
//   const [responseText, setResponseText] = useState('');
//   const [secondResponseText, setSecondResponseText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [dots, setDots] = useState('');

//   useEffect(() => {
//     let interval;
//     if (loading) {
//       // Create a loading animation with dots
//       interval = setInterval(() => {
//         setDots((prev) => (prev.length < 3 ? prev + '.' : '')); // Cycle through dots
//       }, 300);
//     } else {
//       setDots('');
//     }

//     return () => clearInterval(interval); // Clear the interval on component unmount
//   }, [loading]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const inputData = e.target.elements.input.value;
//     const outputData = e.target.elements.output.value;
  
//     // Construct the first prompt using both input and output
//     const prompt = `
//       <|begin_of_text|><|start_header_id|>system<|end_header_id|>
  
//       You are a helpful assistant.
  
//       <|eot_id|><|start_header_id|>user<|end_header_id|>
  
//       1. Generate a generalized prompt that instructs an LLM to transform the given "Input" into the "Desired Output." Ensure the prompt is not overly specific to the example "Input," but is designed to reliably produce the exact "Desired Output." 
  
//       2. The format of the generated output should exactly match the "Desired Output," ensuring the structure is specific and exact to the example including, explicitly mentioning same special characters.
  
//       3. The recommended prompt should include a reference to the input variable \${inputData}.
  
//       3. Do not include anything but the prompt.
  
//       Input: ${inputData}
  
//       Desired Output: ${outputData}
  
//       <|eot_id|><|start_header_id|>assistant<|end_header_id|>
//     `;
  
//     setLoading(true);
  
//     try {
//       // First request
//       const res = await fetch('/api/generate', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: 'llama3.1',
//           prompt: prompt,
//           stream: false,
//           options: {
//             temperature: 1.5,
//             top_k: 20
//           }
//         }),
//       });
  
//       const data = await res.json();
//       setResponseText(data.response);
  
//       // Second request using the responseText as input
//       const secondPrompt = `
//         <|begin_of_text|><|start_header_id|>system<|end_header_id|>
  
//         You are a helpful assistant.
  
//         <|eot_id|><|start_header_id|>user<|end_header_id|>
  
//         1. ${data.response}
  
//         2. \${inputData} = ${inputData}
  
//         3. Only return the desired output. Do not include any introductory or conclusive text.
  
//         <|eot_id|><|start_header_id|>assistant<|end_header_id|>
//       `;
  
//       const secondRes = await fetch('/api/generate', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: 'llama3.1',
//           prompt: secondPrompt,
//           stream: false,
//           options: {
//             temperature: 0,
//             top_k: 20
//           }
//         }),
//       });
  
//       const secondData = await secondRes.json();
//       setSecondResponseText(secondData.response);
  
//       // Request similarity calculation
//       const similarityRes = await fetch('http://localhost:5001/api/similarity', { // Update with your Flask server URL if different
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           desired_output: outputData,
//           prompt_output: secondData.response,
//         }),
//       });
  
//       const similarityData = await similarityRes.json();
//       console.log('Cosine Similarity:', similarityData.similarity);
  
//     } catch (error) {
//       setResponseText(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
//     <div className="p-4 h-screen w-screen overflow-scroll bg-blue-800">
//       <h1 className="text-3xl font-bold text-blue-200 mb-4">Project Prototype</h1>

//       <form className="w-full h-full flex-row" onSubmit={handleSubmit}>
//         <div className="flex h-[30rem] w-full space-x-4">
//           {/* Input and output textareas */}
//           <textarea
//             name="input"
//             placeholder="Enter Input Data"
//             className="w-1/3 p-4 rounded-lg"
//             required
//           />
//           <textarea
//             name="output"
//             placeholder="Enter Desired Output"
//             className="w-1/3 p-4 rounded-lg"
//             required
//           />
//           {/* Response Text Box */}
//           <div className="w-1/3 p-4 bg-gray-900 text-white rounded-lg overflow-y-scroll">
//             <h2 className="text-2xl font-semibold mb-2">Recommended Prompt:</h2>
//             {responseText ? (
//               <pre className="whitespace-pre-wrap break-words">
//                 <code>{responseText}</code>
//               </pre>
//             ) : (
//               <p className="text-gray-500">Response will appear here...</p>
//             )}
//           </div>
//         </div>

//         {/* Second Response Display */}
//         <div className="w-full mt-4 p-4 bg-gray-900 text-white rounded-lg">
//           <h2 className="text-2xl font-semibold mb-2">Prompt Output:</h2>
//           {secondResponseText ? (
//             <pre className="whitespace-pre-wrap break-words">
//               <code>{secondResponseText}</code>
//             </pre>
//           ) : (
//             <p className="text-gray-500">Second response will appear here...</p>
//           )}
//         </div>

//         {/* Submit button */}
//         <button
//           type="submit"
//           className="text-white bg-blue-400 font-bold p-4 rounded-lg mt-4"
//           disabled={loading}
//         >
//           {loading ? `Sending${dots}` : 'Send'}
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';

export default function Page() {
  const [bestResponseText, setBestResponseText] = useState('');
  const [bestOutputText, setBestOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');
  const [allResponses, setAllResponses] = useState([]); // New state to store all responses
  const [isCollapsed, setIsCollapsed] = useState(true); // State to control collapse

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
      }, 300);
    } else {
      setDots('');
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputData = e.target.elements.input.value;
    const outputData = e.target.elements.output.value;

    setLoading(true);

    try {
      const temperatures = [0.5, 1.0, 1.5];
      const promptPromises = temperatures.map(async (temp) => {
        const prompt = `
          <|begin_of_text|><|start_header_id|>system<|end_header_id|>
          You are a helpful assistant.
          <|eot_id|><|start_header_id|>user<|end_header_id|>
          1. Generate a generalized prompt that instructs an LLM to transform the given "Input" into the "Desired Output." Ensure the prompt is not overly specific to the example "Input," but is designed to reliably produce the exact "Desired Output." 
          2. The format of the generated output should exactly match the "Desired Output," ensuring the structure is specific and exact to the example including, explicitly mentioning same special characters.
          3. The recommended prompt should include a reference to the input variable \${inputData}.
          4. Do not include anything but the prompt.
          Input: ${inputData}
          Desired Output: ${outputData}
          <|eot_id|><|start_header_id|>assistant<|end_header_id|>
        `;

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.1',
            prompt: prompt,
            stream: false,
            options: {
              temperature: temp,
              top_k: 20,
            },
          }),
        });

        const data = await res.json();
        return data.response;
      });

      const generatedPrompts = await Promise.all(promptPromises);

      const outputPromises = generatedPrompts.map(async (generatedPrompt) => {
        const secondPrompt = `
          <|begin_of_text|><|start_header_id|>system<|end_header_id|>
          You are a helpful assistant.
          <|eot_id|><|start_header_id|>user<|end_header_id|>
          1. ${generatedPrompt}
          2. \${inputData} = ${inputData}
          3. Only return the desired output. Do not include any introductory or conclusive text.
          <|eot_id|><|start_header_id|>assistant<|end_header_id|>
        `;

        const secondRes = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.1',
            prompt: secondPrompt,
            stream: false,
            options: {
              temperature: 0,
              top_k: 20,
            },
          }),
        });

        const secondData = await secondRes.json();
        return secondData.response;
      });

      const generatedOutputs = await Promise.all(outputPromises);
      const similarityPromises = generatedOutputs.map(async (generatedOutput) => {
        const similarityRes = await fetch('http://localhost:5001/api/similarity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            desired_output: outputData,
            prompt_output: generatedOutput,
          }),
        });

        const similarityData = await similarityRes.json();
        return similarityData.similarity;
      });

      const similarities = await Promise.all(similarityPromises);
      const bestIndex = similarities.indexOf(Math.max(...similarities));

      setBestResponseText(generatedPrompts[bestIndex]);
      setBestOutputText(generatedOutputs[bestIndex]);
      
      // Store all responses
      const allResponsesData = generatedPrompts.map((prompt, index) => ({
        prompt,
        output: generatedOutputs[index],
        similarity: similarities[index],
      }));

      setAllResponses(allResponsesData); // Save all responses

    } catch (error) {
      console.error(`Error: ${error.message}`);
      setBestResponseText(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full h-full h-screen w-screen overflow-scroll bg-blue-800">
      <h1 className="text-3xl font-bold text-blue-200 mb-4">Project Prototype</h1>

      <form className="" onSubmit={handleSubmit}>
        <div className="flex h-[30rem] w-full space-x-4">
          <textarea
            name="input"
            placeholder="Enter Input Data"
            className="w-1/3 p-4 rounded-lg"
            required
          />
          <textarea
            name="output"
            placeholder="Enter Desired Output"
            className="w-1/3 p-4 rounded-lg"
            required
          />
          <div className="w-1/3 p-4 bg-gray-900 text-white rounded-lg overflow-y-scroll">
            <h2 className="text-2xl font-semibold mb-2">Best Recommended Prompt:</h2>
            {bestResponseText ? (
              <pre className="whitespace-pre-wrap break-words">
                <code>{bestResponseText}</code>
              </pre>
            ) : (
              <p className="text-gray-500">Best response will appear here...</p>
            )}
          </div>
        </div>

        <div className="w-full mt-4 p-4 bg-gray-900 text-white rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Prompt Output:</h2>
          {bestOutputText ? (
            <pre className="whitespace-pre-wrap break-words">
              <code>{bestOutputText}</code>
            </pre>
          ) : (
            <p className="text-gray-500">Best output will appear here...</p>
          )}
        </div>

        <button
          type="submit"
          className="text-white bg-blue-400 font-bold p-4 rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? `Sending${dots}` : 'Send'}
        </button>
      </form>

      {/* Collapsible component for displaying all other responses */}
      <div className="mt-4">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-blue-400 font-bold p-2 rounded-lg mb-2"
        >
          {isCollapsed ? 'Show All Responses' : 'Hide All Responses'}
        </button>
        {!isCollapsed && (
          <div className="p-4 bg-gray-700 text-white rounded-lg">
            <h2 className="text-xl font-semibold mb-2">All Responses:</h2>
            {allResponses.length > 0 ? (
              allResponses.map((response, index) => (
                <div key={index} className="mb-2 p-2 border-b border-gray-600">
                  <p><strong>Prompt:</strong> {response.prompt}</p>
                  <p><strong>Output:</strong> {response.output}</p>
                  <p><strong>Similarity:</strong> {response.similarity}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No responses available...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
