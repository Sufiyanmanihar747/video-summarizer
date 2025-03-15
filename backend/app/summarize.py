# summarize.py
from transformers import pipeline
import os
import sys

text_file = "./transcripts/video_transcript1.txt"
def summarize_text(input_path):

    try:
        
        with open(input_path, 'r', encoding='utf-8') as f:
            text = f.read().strip()
        
        summarizer = pipeline("summarization", model="t5-small")
        
        summary = summarizer(text, max_length=150, min_length=40, do_sample=False)[0]["summary_text"]
        
        summaries_dir = "./summaries"
        
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(summaries_dir, f"{base_name}_summary.txt")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(summary)
            
        print(f"Summary saved to: {output_path}")
        return summary
        
    except Exception as e:
        print(f"An error occurred during summarization: {e}")
        return None

if __name__ == "__main__":
        
    summary = summarize_text(text_file)
    if summary:
        print("\nSummary:")
        print(summary)