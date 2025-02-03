import openparse
from openparse import DocumentParser
from llama_index.core import VectorStoreIndex
from dotenv import load_dotenv
import os
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.core import Settings

# Load environment variables
load_dotenv()

# Use Ollama for both embedding and LLM
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")  # Embedding model
Settings.llm = Ollama(model="llama3.2")  # LLM (change to another model if needed)

# Parse the document
doc_path = "./Testing.pdf"
parser = DocumentParser()
parsed_doc = parser.parse(doc_path)

# Convert to LlamaIndex nodes
nodes = parsed_doc.to_llama_index_nodes()
index = VectorStoreIndex(nodes=nodes)

# Create a query engine and perform a query
query_engine = index.as_query_engine()
response = query_engine.query("các bước Implement test data")
print(response)
