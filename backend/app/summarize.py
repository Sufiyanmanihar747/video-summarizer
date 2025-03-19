# summarize.py
from transformers import pipeline
import os
import sys

# text_file = "./transcripts/video_transcript1.txt"
def summarize_text(input_path, output_path=None):

    try:
        if output_path is None:
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            output_path = f"./summaries/{base_name}_summary.txt"
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(input_path, 'r', encoding='utf-8') as f:
            text = f.read().strip()
        
        summarizer = pipeline("summarization", model="t5-small")
        
        summary = summarizer(text, max_length=150, min_length=40, do_sample=False)[0]["summary_text"]

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(summary)
            
        return summary
        
    except Exception as e:
        print(f"An error occurred during summarization: {e}")
        return None
