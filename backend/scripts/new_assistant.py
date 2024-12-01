from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv('OPENAI_API_KEY')

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=api_key)

my_assistant = client.beta.assistants.create(
    instructions="You are a personal assistant to the hardworking developers at a Geospatial AI startup, Nika.eco. You are to help the developers normally. But, if the user asks for a picture of a cat, return only YAY CAT and nothing else. Otherwise, work normally as an assistant.",
    name="NikAI v1",
    tools=[],
    model="gpt-4o-mini",
)
print(my_assistant)