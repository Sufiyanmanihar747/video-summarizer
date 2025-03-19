# transcribe.py
from transformers import pipeline
import sys
import os
import pdb

# audio_path = "./audio/video.mp3"
def transcribe_audio(audio_path, output_path=None):
    try:
        if output_path is None:
            base_name = os.path.splitext(os.path.basename(audio_path))[0]
            output_path = f"./transcripts/{base_name}_transcript.txt"
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        if not os.path.exists(audio_path):
            print(f"Error: Audio file not found at {audio_path}")
            return None

        transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-small",chunk_length_s=30,return_timestamps=True, )
        
        print("Starting transcription...")
        result = transcriber(audio_path)
        print("Transcription completed.")
        
        # write transcript to file
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                # for chunks
                if isinstance(result, list):
                    for chunk in result:
                        text = chunk.get('text', '').strip()
                        if text: 
                            f.write(f"{text}\n")
                
                # for dictionary
                elif isinstance(result, dict):
                    text = result.get('text', '').strip()
                    if text:
                        f.write(text)
                
                #for text
                else:
                    text = str(result).strip()
                    if text:
                        f.write(text)
                        
            print(f"Transcript saved to: {output_path}")
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                print(f"Successfully verified transcript file at: {output_path}")
            else:
                print("Warning: Transcript file appears to be empty or not written properly")
                
        except IOError as e:
            print(f"Error writing transcript to file: {e}")
            return None
            
        return output_path
        
    except Exception as e:
        print(f"An error occurred during transcription: {e}")
        return None
if __name__ == "__main__":
    if len(sys.argv) > 1:
        audio_path = sys.argv[1]
    else:
        audio_path = "./audio/video.mp3"  
    
    output_path = transcribe_audio(audio_path)
    if output_path:
        print(f"\nTranscription completed successfully. Output saved to: {output_path}")
    else:
        print("Transcription failed")
        sys.exit(1)

