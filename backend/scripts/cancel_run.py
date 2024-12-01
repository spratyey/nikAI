from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv('OPENAI_API_KEY')

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=api_key)

run = client.beta.threads.runs.cancel(
  thread_id="thread_viWZxNTuGAt5421glYi8rArj",
  run_id="run_4MPl1lxBrxoVDpm3cjIAWniz"
)

print(run)
