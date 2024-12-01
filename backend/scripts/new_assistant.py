from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv('OPENAI_API_KEY')

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=api_key)

# my_assistant = client.beta.assistants.create(
#     instructions="You are a personal assistant to the hardworking developers at a Geospatial AI startup, Nika.eco. You are to help the developers normally. But, if the user asks for a picture of a cat, return only YAY CAT and nothing else. Otherwise, work normally as an assistant.",
#     name="NikAI v1",
#     tools=[],
#     model="gpt-4o-mini",
# )

# assistant2 = client.beta.assistants.create(
#   instructions="You are a personal assistant to the hardworking developers at a Geospatial AI startup, Nika.eco. You are to help the developers normally. But, if the user asks for a picture(s) of cats, use your function calling ability to return urls of cat pictures. Otherwise, work normally as an assistant.",
#   model="gpt-4o-mini",
#   name="NikAI_v2",
#   tools=[
#     {
#       "type": "function",
#       "function": {
#         "name": "fetchRandomCatImages",
#         "description": "Internally the CatAPI from CatAPI.com to fetch a specified number of random cat pictures.",
#         "parameters": {
#           "type": "object",
#           "properties": {
#             "limit": {
#               "type": "integer",
#               "description": "The cnumber of cat pictures to be fetched."
#             }
#           },
#           "required": ["limit"]
#         }
#       }
#     }
#   ]
# )

assistant3 = client.beta.assistants.create(
  instructions="You are a personal assistant to the hardworking developers at a Geospatial AI startup, Nika.eco. You are to help the developers normally. But, if the user asks for a picture(s) of cats, use your function calling ability to return urls of cat pictures. Otherwise, work normally as an assistant.",
  model="gpt-4o-mini",
  name="NikAI_v3",
  tools=[
    {
      "type": "function",
      "function": {
        "name": "fetchRandomCatImages",
        "description": "Internally calls the CatAPI from CatAPI.com to fetch a specified number of random cat picture URLs. If breeds are specified, it tries to look for pictures of cats of those specific breeds. If these are not found / if breeds are not specified, random cat picture URLs are returned,",
        "parameters": {
          "type": "object",
          "properties": {
            "limit": {
              "type": "integer",
              "description": "The number of cat pictures to be fetched."
            },
            "breedNames":{
                "type":"string",
                "description":"A comma separated string of one or more breeds that the user may specify they want pictures of. Can be left empty."
            }
          },
          "required": ["limit"]
        }
      }
    }
  ]
)
print(assistant3)

