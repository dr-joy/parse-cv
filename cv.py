import openparse
from openparse import processing, DocumentParser
from llama_index.core import VectorStoreIndex
import openai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = api_key
doc_path = "./Hoang Van Thuan_iOS.pdf"
semantic_pipeline = processing.SemanticIngestionPipeline(
    openai_api_key=api_key,
    model="text-embedding-ada-002",
    min_tokens=64,
    max_tokens=1024,
)
parser = openparse.DocumentParser(processing_pipeline=semantic_pipeline)
parsed_doc = parser.parse(doc_path)

nodes = parsed_doc.to_llama_index_nodes()
index = VectorStoreIndex(nodes=nodes)
query_engine = index.as_query_engine()
response = query_engine.query("Trả về họ và tên, tuổi, địa chỉ, quá trình học tập, kinh nghiệm làm việc trả dữ liệu về định dạng json với các trường tương ứng sử dụng key tiếng anh")
print(response)