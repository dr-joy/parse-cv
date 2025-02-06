import os
import openai
import openparse
from openparse import processing, DocumentParser
from llama_index.core import VectorStoreIndex
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import json
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Get OpenAI API key from .env file
api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = api_key

# Initialize OpenParse processing pipeline
semantic_pipeline = processing.SemanticIngestionPipeline(
    openai_api_key=api_key,
    model="text-embedding-ada-002",
    min_tokens=64,
    max_tokens=1024,
)

app = Flask(__name__)
CORS(app)  # Cho phép tất cả các origin truy cập API

@app.route("/process_cv", methods=["POST"])
def process_cv():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    try:
        # Save the uploaded file temporarily
        temp_path = os.path.join("./cv/", file.filename)
        file.save(temp_path)
        
        # Parse document
        parser = DocumentParser()
        parsed_doc = parser.parse(temp_path)

        # Convert document to LlamaIndex nodes
        nodes = parsed_doc.to_llama_index_nodes()

        # Create a VectorStoreIndex for the current CV
        index = VectorStoreIndex(nodes=nodes)
        query_engine = index.as_query_engine()

        # Define query to extract structured data
        query = """
        Trả về họ và tên, tuổi, email, địa chỉ, quá trình học tập, kinh nghiệm làm việc.
        với định dạng JSON như bên dưới. Nếu thông tin không có thì trả về "" (chuỗi rỗng).
        {
           "name": "",
           "age": "",
           "email": "",
           "address": "",
           "education": "",
           "work_experience": ""
        }
        """

        response = query_engine.query(query)
        
        # Remove temp file
        os.remove(temp_path)
        return jsonify(json.loads(response.response))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
