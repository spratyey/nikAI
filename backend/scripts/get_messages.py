from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv('OPENAI_API_KEY')
thread_id=os.getenv('THREAD_ID')

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=api_key)

thread_messages = client.beta.threads.messages.list(thread_id)
print(thread_messages.data)