# transcribe.py
from transformers import pipeline
import sys
import os
import pdb

audio_path = "./audio/video.mp3"
def transcribe_audio(audio_path):
    try:

        if not os.path.exists(audio_path):
            print(f"Error: Audio file not found at {audio_path}")
            return None

        transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-small",chunk_length_s=30,return_timestamps=True,)
        result = transcriber(audio_path, generate_kwargs={"language": "english", "task": "transcribe"})
        
        # pdb.set_trace()
        # print(result)

        if isinstance(result, dict):
            transcript = result["text"]
        else:
            transcript = ' '.join(chunk['text'] for chunk in result)
        
        if not transcript:
            print("Error: No transcript was generated")
            return None
            
        output_dir = "./transcripts"
        
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        output_path = os.path.join(output_dir, f"{base_name}_transcript.txt")
        
        # write transcript to file
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(transcript)
            print(f"Transcript saved to: {output_path}")
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                print(f"Successfully verified transcript file at: {output_path}")
            else:
                print("Warning: Transcript file appears to be empty or not written properly")
                
        except IOError as e:
            print(f"Error writing transcript to file: {e}")
            return None
            
        return transcript
    except Exception as e:
        print(f"An error occurred during transcription: {e}")
        return None

if __name__ == "__main__":
   transcribe_audio(audio_path)
   
