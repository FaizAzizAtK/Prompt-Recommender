// pages/api/generate.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { model, prompt, stream, options } = req.body;
  
      // Log the incoming request body for debugging
      console.log('Request Body:', req.body);
  
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, prompt, stream, options }), 
        });
  
        // Check if the response is okay (status code 200-299)
        if (!response.ok) {
          // Log the response status and message for debugging
          const errorMessage = await response.text();
          console.error('Error from Ollama:', response.status, errorMessage);
          return res.status(response.status).json({ error: errorMessage });
        }
  
        const data = await response.json();
        res.status(200).json(data); // Send back the response from Ollama
      } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  