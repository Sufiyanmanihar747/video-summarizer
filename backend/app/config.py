from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi


# MongoDB Atlas configuration
MONGO_URI = "mongodb+srv://sufiyan:sufiyanManiharMongodb@cluster0.3ifl2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "video_summarizer"

# Initialize MongoDB client
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client[DB_NAME]

users_collection = db["users"]
summaries_collection = db["summaries"]
gemini_questions = db['gemini_questions']


try:
    client.admin.command('ping')
    print("Connected to MongoDB Atlas successfully! 🎉")
except Exception as e:
    print(f"Failed to connect to MongoDB Atlas: {e}")

# Export the collections
users = users_collection
summaries = summaries_collection