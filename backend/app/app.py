import os
import subprocess
from flask import Flask, request as flask_request, jsonify
from flask_cors import CORS
from extract_audio import extract_audio
from transcribe import transcribe_audio
from summarize import summarize_text

app = Flask(__name__)
# Enable CORS for the endpoint.
CORS(app, resources={r"/process_video": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

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

@app.route('/process_video', methods=['POST'])
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
        
        response["message"] = "Generated transcript"

        # Step 4: Summarize Transcript
        print("Summarizing...")
        summary = summarize_text(transcript_path, f"./summaries/{unique_id}_summary.txt")
        if not summary:
            return jsonify({"error": "Failed to summarize transcript"}), 500
        
        response["status"] = "completed"
        response["message"] = "Process completed!"
        response["summary"] = summary

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

if __name__ == "__main__":

    for dir in ["videos", "audio", "transcripts", "summaries"]:
        os.makedirs(dir, exist_ok=True)
    
    app.run(debug=True)
