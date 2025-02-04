import os
import openai
import openparse
from openparse import processing, DocumentParser
from llama_index.core import VectorStoreIndex
from dotenv import load_dotenv
import csv
import json

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

# CSV file path
csv_file = "cv_data.csv"

# Write header row to CSV
with open(csv_file, mode="w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Name", "Age", "Email", "Address", "Education", "Work Experience"])


# Process each CV file
for cv_file in cv_files:
    cv_path = os.path.join(cv_folder, cv_file)
    print(f"Processing CV: {cv_file}...")

    try:
        # Parse document
        parser = DocumentParser()
        parsed_doc = parser.parse(cv_path)

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

        try:
            # Convert response to dictionary. Handle potential JSON decode errors.
            cv_data = json.loads(response.response)

            # Write extracted data to CSV (append to file)
            with open(csv_file, mode="a", encoding="utf-8", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([
                    cv_data.get("name", ""),
                    cv_data.get("age", ""),
                    cv_data.get("email", ""),
                    cv_data.get("address", ""),
                    cv_data.get("education", ""),
                    cv_data.get("work_experience", "")
                ])

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON for {cv_file}: {e}")
            print(f"Response was: {response.response}") #print the response to help debug
            # Optionally, you could write the raw response to the CSV for manual inspection
            with open(csv_file, mode="a", encoding="utf-8", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([cv_file,"JSON Decode Error", response.response]) #write the filename and error

    except Exception as e:
        print(f"Error processing {cv_file}: {e}")
        # Optionally, add error handling for file processing issues (e.g., file not found)
        with open(csv_file, mode="a", encoding="utf-8", newline="") as file:
                writer = csv.writer(file)
                writer.writerow([cv_file,"File Processing Error", str(e)])


print(f"✅ CV data saved to {csv_file} successfully!")