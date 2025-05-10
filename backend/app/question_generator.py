from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
import nltk
from nltk.tokenize import sent_tokenize
import random
import os

# Set NLTK data path to a directory in your project
nltk.data.path.append(os.path.join(os.path.dirname(__file__), 'nltk_data'))

# Download required NLTK data
def download_nltk_data():
    try:
        print("Downloading NLTK data...")
        nltk.download('punkt', quiet=True)
        nltk.download('averaged_perceptron_tagger', quiet=True)
        print("NLTK data downloaded successfully")
    except Exception as e:
        print(f"Error downloading NLTK data: {str(e)}")

# Download NLTK data at startup
download_nltk_data()

class QuestionGenerator:
    def __init__(self):
        print("Initializing Question Generator...")
        self.model_name = "t5-small"
        self.tokenizer = T5Tokenizer.from_pretrained(self.model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(self.model_name)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        print(f"Model loaded successfully on {self.device}")

    def generate_better_distractors(self, answer, text, num_distractors=3):
        try:
            # Split text into sentences and words
            sentences = text.split('.')
            words = text.split()
            
            # Generate distractors using different strategies
            distractors = set()
            
            # Strategy 1: Use similar length phrases from text
            for i in range(len(words) - len(answer.split())):
                phrase = ' '.join(words[i:i + len(answer.split())])
                if phrase.lower() != answer.lower() and len(phrase) > 2:
                    distractors.add(phrase)
            
            # Strategy 2: Use key sentences as distractors
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence.split()) > 3 and sentence.lower() != answer.lower():
                    distractors.add(sentence)
            
            # Strategy 3: Create a simple reversal of the answer's words (if possible)
            words_in_answer = answer.split()
            if len(words_in_answer) > 1:
                distractors.add(' '.join(words_in_answer[::-1]))
            
            distractor_list = list(distractors)[:num_distractors]
            
            # If not enough distractors, add generic ones
            while len(distractor_list) < num_distractors:
                distractor_list.append(f"Alternative {len(distractor_list)+1}")
                
            return distractor_list[:num_distractors]

        except Exception as e:
            print(f"Error generating distractors: {str(e)}")
            return [f"Option {i+1}" for i in range(num_distractors)]

    def generate_questions(self, text, num_questions=3):
        try:
            print(f"Starting question generation for text length: {len(text)}")
            
            # Use a refined prompt to encourage short questions
            question_input = (
                "Generate a short multiple choice question based on the text. "
                "Keep the question concise and clear. "
                f"Text: {text}\n"
            )

            # Encode the prompt; reduce max_length to encourage short output
            question_inputs = self.tokenizer.encode(
                question_input,
                return_tensors="pt",
                max_length=256,
                truncation=True
            ).to(self.device)

            print("Generating initial questions...")
            outputs = self.model.generate(
                question_inputs,
                max_length=50,  # Set to a lower max_length to produce shorter questions
                num_return_sequences=num_questions,
                num_beams=5,
                temperature=0.8,
                top_k=50,
                top_p=0.95,
                no_repeat_ngram_size=2,
                early_stopping=True
            )

            mcq_questions = []
            for i, output in enumerate(outputs):
                try:
                    question = self.tokenizer.decode(output, skip_special_tokens=True)
                    print(f"Generated question {i+1}: {question}")
                    
                    if not question.strip() or len(question) < 10:
                        print(f"Skipping short/empty question {i+1}")
                        continue

                    # Generate answer with a clear prompt
                    answer_input = (
                        "Based on the following text, generate a short questions and miss some keywords like fill in the blanks \n"
                        f"Text: {text}\n"
                        f"Question: {question}\n"
                        "Provide a concise answer."
                    )
                    
                    answer_inputs = self.tokenizer.encode(
                        answer_input,
                        return_tensors="pt",
                        max_length=256,
                        truncation=True
                    ).to(self.device)

                    answer_outputs = self.model.generate(
                        answer_inputs,
                        max_length=20,  # Lower max_length for short answers
                        num_return_sequences=1,
                        num_beams=4,
                        temperature=0.7,
                        top_k=50,
                        top_p=0.95
                    )
                    
                    answer = self.tokenizer.decode(answer_outputs[0], skip_special_tokens=True)
                    print(f"Generated answer: {answer}")
                    
                    if not answer.strip() or len(answer) < 2:
                        print(f"Skipping question {i+1} due to invalid answer")
                        continue

                    # Generate distractors using our method
                    distractors = self.generate_better_distractors(answer, text)
                    print(f"Generated distractors: {distractors}")
                    
                    # Create options list and shuffle
                    options = [answer] + distractors
                    random.shuffle(options)
                    correct_index = options.index(answer)
                    
                    mcq_question = {
                        "question": question,
                        "options": options,
                        "correct_answer": correct_index,
                        "explanation": f"The correct answer is: {answer}"
                    }
                    mcq_questions.append(mcq_question)
                    print(f"Added question {i+1} to list")

                except Exception as e:
                    print(f"Error processing question {i+1}: {str(e)}")
                    continue

            print(f"Successfully generated {len(mcq_questions)} questions")
            
            # Fallback if no questions generated
            if not mcq_questions:
                print("Generating fallback question...")
                first_sentence = text.split('.')[0] + '.'
                fallback_question = {
                    "question": f"What is mentioned in this text: '{first_sentence}'",
                    "options": [
                        first_sentence,
                        "This is not mentioned",
                        "None of the above",
                        "Cannot determine from the text"
                    ],
                    "correct_answer": 0,
                    "explanation": f"The correct answer is directly stated in the text: {first_sentence}"
                }
                mcq_questions.append(fallback_question)

            return mcq_questions

        except Exception as e:
            print(f"Error in generate_questions: {str(e)}")
            return []

# Initialize the question generator
print("Starting Question Generator initialization...")
question_generator = QuestionGenerator()
print("Question Generator initialization complete!")