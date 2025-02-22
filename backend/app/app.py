import os
from pytube import YouTube
import requests

from pytube import request

# Add this before creating the YouTube object
request.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

def check_video_access(url):
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Video is accessible!")
    else:
        print("YouTube is blocking the request.")

url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
check_video_access(url)


def download_video(url, folder="videos"):
    try:
        yt = YouTube(url)
        streams = yt.streams.filter(progressive=True, file_extension="mp4")
        if not streams:
            print("No valid stream found.")
            return None
        
        stream = streams.get_highest_resolution()
        
        if not os.path.exists(folder):
            os.makedirs(folder)
        
        output_path = os.path.join(folder, f"{yt.title}.mp4")
        stream.download(output_path=folder)
        
        print(f"Video downloaded successfully: {output_path}")
        return output_path
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
download_video(url)
