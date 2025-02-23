import os
import subprocess
from flask import Flask, request as flask_request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for the endpoint.
CORS(app, resources={r"/download_video": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

def download_video_with_ytdlp(url, folder="videos"):
    """
    Uses yt-dlp to download a video from the given URL.
    The video is saved in the specified folder.
    Returns the path to the downloaded video file, or None if failed.
    """
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    # The output template: save file as "title.ext" in the folder.
    output_template = os.path.join(folder, "%(title)s.%(ext)s")
    
    command = ["yt-dlp", "-f", "mp4", "-o", output_template, url]
    try:
        # Run the yt-dlp command
        subprocess.run(command, check=True)
        
        # Find the downloaded file in the folder
        files = os.listdir(folder)
        mp4_files = [f for f in files if f.endswith(".mp4")]
        if mp4_files:
            # For simplicity, return the first MP4 file found
            video_path = os.path.join(folder, mp4_files[0])
            print(f"Video downloaded successfully: {video_path}")
            return video_path
        else:
            print("No MP4 file found after download.")
            return None
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while downloading video: {e}")
        return None

@app.route('/download_video', methods=['POST'])
def download_video_api():
    data = flask_request.get_json()
    url = data.get("url")
    
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    video_path = download_video_with_ytdlp(url)
    if video_path:
        return jsonify({"message": "Video downloaded successfully", "path": video_path}), 200
    else:
        return jsonify({"error": "Failed to download video"}), 500

if __name__ == "__main__":
    app.run(debug=True)
