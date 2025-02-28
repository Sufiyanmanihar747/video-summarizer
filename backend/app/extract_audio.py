# extract_audio.py
from flask import Flask
# import moviepy.editor as mp 
import sys
import ffmpeg
import pdb
import os

app = Flask(__name__)
video_path = './videos/video.mp4'

# Get video filename without extension and create audio path
video_filename = os.path.splitext(os.path.basename(video_path))[0]
audio_path = f"./audio/{video_filename}.mp3"


def extract_audio(video_path, output_audio_path=None):

    try:
        if output_audio_path is None:
            video_filename = os.path.splitext(os.path.basename(video_path))[0]
            output_audio_path = f"./audio/{video_filename}.mp3"
        
        ffmpeg.input(video_path).output(output_audio_path, format="mp3").run()
        return output_audio_path
    except Exception as e:
        print(f"An error occurred during audio extraction: {e}")
        return None

if __name__ == "__main__":
    extract_audio(video_path, audio_path)
    app.run(debug=True)

