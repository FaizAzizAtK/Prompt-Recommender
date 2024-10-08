from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app)  # Allow all origins for testing

model = SentenceTransformer('all-MiniLM-L6-v2')  # Load the model once

@app.route('/api/similarity', methods=['POST'])
def calculate_similarity():
    data = request.json
    desired_output = data.get('desired_output')
    prompt_output = data.get('prompt_output')

    # Generate embeddings
    desired_embedding = model.encode(desired_output, convert_to_tensor=True)
    prompt_embedding = model.encode(prompt_output, convert_to_tensor=True)

    # Calculate cosine similarity
    cosine_similarity = util.pytorch_cos_sim(desired_embedding, prompt_embedding).item()
    
    return jsonify({'similarity': cosine_similarity})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

