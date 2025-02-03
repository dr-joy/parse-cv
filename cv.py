import os
import openai
import openparse
from openparse import processing, DocumentParser
from llama_index.core import VectorStoreIndex
from dotenv import load_dotenv
import csv

# Load environment variables
load_dotenv()

# Get OpenAI API key from .env file
api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = api_key

# Define folder containing CVs
cv_folder = "./cv/"

# Initialize OpenParse processing pipeline
semantic_pipeline = processing.SemanticIngestionPipeline(
    openai_api_key=api_key,
    model="text-embedding-ada-002",
    min_tokens=64,
    max_tokens=1024,
)

# List all PDF files in the folder
cv_files = [f for f in os.listdir(cv_folder) if f.endswith(".pdf")]

# Store parsed nodes from all CVs
all_nodes = []

# Process each CV file
for cv_file in cv_files:
    cv_path = os.path.join(cv_folder, cv_file)
    print(f"Processing CV: {cv_file}...")

    # Parse document
    parser = DocumentParser()
    parsed_doc = parser.parse(cv_path)

    # Convert document to LlamaIndex nodes and store them
    nodes = parsed_doc.to_llama_index_nodes()
    all_nodes.extend(nodes)  # Append nodes to the list

# Create a VectorStoreIndex with all parsed nodes
index = VectorStoreIndex(nodes=all_nodes)

# Create a query engine
query_engine = index.as_query_engine()

# Define query to extract structured data from all CVs
query = """
Trả về họ và tên, tuổi, địa chỉ, quá trình học tập, kinh nghiệm làm việc.
Trả dữ liệu về định dạng JSON với các trường tương ứng sử dụng key tiếng Anh.
"""
response = query_engine.query(query)

# Print response
print(response)

# Convert response to JSON format
cv_data = response.response  # Assuming response.response is JSON-like

# Define CSV file path
csv_file = "cv_data.csv"

# Write extracted data to CSV
with open(csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)

    # Write header row
    writer.writerow(["Name", "Age", "Address", "Education", "Work Experience"])

    # Write data row
    writer.writerow([
        cv_data.get("name", ""), 
        cv_data.get("age", ""), 
        cv_data.get("address", ""), 
        "; ".join([f"{edu['degree']} - {edu['university']} ({edu['year']})" for edu in cv_data.get("education", [])]),
        "; ".join([f"{exp['role']} at {exp['company']} ({exp['years']})" for exp in cv_data.get("work_experience", [])])
    ])

print(f"✅ CV data saved to {csv_file} successfully!")