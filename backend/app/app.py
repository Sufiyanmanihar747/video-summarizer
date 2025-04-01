from datetime import timedelta, datetime
import os
import subprocess
from threading import get_native_id
from flask import Flask, request as flask_request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from extract_audio import extract_audio
from transcribe import transcribe_audio
from summarize import summarize_text
from werkzeug.security import generate_password_hash, check_password_hash
from config import users, summaries
from question_generator import question_generator
import google.generativeai as genai
import json

app = Flask(__name__)
app.secret_key = os.urandom(24)

app.config["JWT_SECRET_KEY"] = "your-secret-key"  # Change this!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
# Enable CORS for the endpoint.
# CORS(app, resources={r"/process_video": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

# Configure Gemini with your free API key
genai.configure(api_key='AIzaSyA1mBE3clDzxBZstTBzIAxHKbaX4H38Afk')

model = genai.GenerativeModel('gemini-1.5-pro')  # Updated model name

def download_video_with_ytdlp(url, folder="videos"):
   
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    output_template = os.path.join(folder, "%(title)s.%(ext)s")
    
    command = ["yt-dlp", "-f", "mp4", "-o", output_template, url]
    try:

        subprocess.run(command, check=True)
        
        files = os.listdir(folder)
        mp4_files = [f for f in files if f.endswith(".mp4")]

        if mp4_files:
            video_path = os.path.join(folder, mp4_files[0])
            print(f"Video downloaded successfully: {video_path}")
            return video_path
        else:
            print("No MP4 file found after download.")
            return None
        
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while downloading video: {e}")
        return None

    

def generate_unique_filename(url):
    """Generate a unique filename based on timestamp and video ID"""
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    try:
        video_id = url.split('/')[-1].split('?')[0]
    except:
        video_id = timestamp
    return f"{timestamp}_{video_id}"

@app.route('/register', methods=['POST'])
def register():
    try:
        data = flask_request.get_json()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName')
        
        if not email or not password or not full_name:
            return jsonify({"error": "All fields are required"}), 400
            
        if users.find_one({"email": email}):
            return jsonify({"error": "Email already exists"}), 400
            
        hashed_password = generate_password_hash(password)
        
        users.insert_one({
            "email": email,
            "password": hashed_password,
            "full_name": full_name
        })
        
        return jsonify({"message": "User registered successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = flask_request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = users.find_one({"email": email})
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({"error": "Invalid email or password"}), 401
            
        access_token = create_access_token(identity=email)
        
        return jsonify({
            "token": access_token,
            "user": {
                "email": user['email'],
                "full_name": user.get('full_name')
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_auth', methods=['GET'])
@jwt_required()
def check_auth():
    current_user_email = get_jwt_identity()
    user = users.find_one({"email": current_user_email})
    
    if user:
        return jsonify({
            "user": {
                "email": user['email'],
                "full_name": user.get('full_name')
            }
        }), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/process_video', methods=['POST'])
@jwt_required()
def process_video():
    try:
        data = flask_request.get_json()
        url = data.get("url")
        
        if not url:
            return jsonify({"error": "No URL provided"}), 400

        unique_id = generate_unique_filename(url)

        # Step 1: Download Video
        print("Downloading video...")
        video_path = download_video_with_ytdlp(url, folder="videos")
        if not video_path:
            return jsonify({"error": "Failed to download video"}), 500
        
        response = {
            "status": "processing",
            "message": "Downloaded video"
        }

        # Step 2: Extract Audio
        print("Extracting audio...")
        audio_path = extract_audio(video_path, f"./audio/{unique_id}.mp3")
        if not audio_path:
            return jsonify({"error": "Failed to extract audio"}), 500
        
        response["message"] = "Extracted audio"

        # Step 3: Transcribe Audio
        print("Transcribing audio...")
        transcript_path = transcribe_audio(audio_path, f"./transcripts/{unique_id}_transcript.txt")
        if not transcript_path:
            return jsonify({"error": "Failed to transcribe audio"}), 500
        
        with open(transcript_path, "r", encoding="utf-8") as file:
            transcript_content = file.read()
        
        response["message"] = "Generated transcript"

        # Step 4: Summarize Transcript
        print("Summarizing...")
        summary = summarize_text(transcript_path, f"./summaries/{unique_id}_summary.txt")
        if not summary:
            return jsonify({"error": "Failed to summarize transcript"}), 500
        
        response["status"] = "completed"
        response["message"] = "Process completed!"
        response["summary"] = summary
        response['title'] = video_path
        response['url'] = url
        response['transcript'] = transcript_content
        
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():

    status = {
        "videos": os.listdir("videos") if os.path.exists("videos") else [],
        "audio": os.listdir("audio") if os.path.exists("audio") else [],
        "transcripts": os.listdir("transcripts") if os.path.exists("transcripts") else [],
        "summaries": os.listdir("summaries") if os.path.exists("summaries") else []
    }
    return jsonify(status), 200

@app.route('/save_summary', methods=['POST'])
@jwt_required()
def save_summary():
    try:
        current_user = get_jwt_identity()
        data = flask_request.get_json()
        
        summary_data = {
            "user_email": current_user,
            "video_url": data.get('url'),
            "title": data.get('title'),
            "summary": data.get('summary'),
            "transcription": data.get('transcription'),
            "created_at": datetime.utcnow()
        }
        
        summaries.insert_one(summary_data)
        return jsonify({"message": "Summary saved successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        current_user = get_jwt_identity()
        user_summaries = list(summaries.find(
            {"user_email": current_user},
            {"_id": 0}
        ).sort("created_at", -1))
        
        return jsonify({"history": user_summaries}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_questions', methods=['POST'])
@jwt_required()
def generate_questions():
    try:
        data = flask_request.get_json()
        text = data.get('text', '')
        num_questions = data.get('num_questions', 3)  

        if not text:
            return jsonify({"error": "No text provided"}), 400

        questions = question_generator.generate_questions(text, num_questions)
        
        print(f"Returning {len(questions)} questions")
        
        return jsonify({
            "success": True,
            "questions": questions
        }), 200

    except Exception as e:
        print(f"Error in generate_questions route: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/generate_gemini_questions', methods=['POST'])
@jwt_required()
def generate_gemini_questions():
    try:
        data = flask_request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Simplified prompt
        prompt = f"""
        Create 3 multiple choice questions based on this text. Format as JSON array.
        Each question needs:
        - Question text
        - 4 options (1 correct, 3 incorrect)
        - Correct answer index (0-3)
        - Brief explanation

        Text: {text}

        Format:
        [
          {{
            "question": "What is...",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 0,
            "explanation": "Because..."
          }}
        ]
        """

        print("Sending request to Gemini...")
        response = model.generate_content(prompt)
        print(f"Received response: {response.text[:100]}...") 

        # Parse response
        try:
            response_text = response.text.strip()
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            print(f"Cleaned response text: {response_text[:100]}...")
            questions = json.loads(response_text)
            
            validated_questions = []
            for q in questions:
                if all(key in q for key in ['question', 'options', 'correct_answer', 'explanation']):
                    if len(q['options']) == 4 and isinstance(q['correct_answer'], int):
                        validated_questions.append(q)
            
            if not validated_questions:
                raise ValueError("No valid questions generated")

            return jsonify({
                "success": True,
                "questions": validated_questions
            }), 200

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Response text: {response_text}")
            return jsonify({
                "error": "Failed to parse generated questions",
                "questions": []
            }), 200

    except Exception as e:
        print(f"Error in generate_gemini_questions: {str(e)}")
        return jsonify({
            "error": str(e),
            "questions": []
        }), 200


if __name__ == "__main__":

    for dir in ["videos", "audio", "transcripts", "summaries"]:
        os.makedirs(dir, exist_ok=True)
    
    app.run(debug=True)
