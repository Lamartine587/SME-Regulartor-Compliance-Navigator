import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Force Python to read the .env file
load_dotenv()

# Grab the cloud URL
MONGO_URL = os.getenv("MONGODB_URL")

# Initialize the client
client = AsyncIOMotorClient(MONGO_URL)

# This automatically grabs "SMERegulator" right out of your connection string!
mongo_db = client.get_default_database()

def get_mongo_db():
    return mongo_db