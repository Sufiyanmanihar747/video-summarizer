# Video Summarizer

## Overview
The Video Summarizer is a web application that allows users to upload videos, which are then processed to extract audio, transcribe it, summarize the content, and generate questions based on the summary. This application leverages various machine learning models and APIs to enhance the user experience and provide valuable insights from video content.

## Features
- **User Registration and Authentication:** Secure user login and registration using JWT.
- **Video Processing:** Upload video URLs, which are downloaded and processed.
- **Audio Extraction:** Extract audio from videos for transcription.
- **Transcription:** Convert audio to text using Google Cloud Speech-to-Text API.
- **Summarization:** Generate concise summaries of the transcribed text using advanced NLP models.
- **Question Generation:** Create AI-generated questions based on the summaries.
- **History Tracking:** View, manage, and delete past summaries and generated questions.
- **Responsive Design:** User-friendly interface that works on various devices.

## Technologies Used
- **Frontend:**
  - React.js for building the user interface.
  - Axios for making API requests.
  - CSS for styling and layout.

- **Backend:**
  - Flask as the web framework for building the API.
  - MongoDB for storing user data, summaries, and generated questions.
  - Google Cloud Speech-to-Text API for audio transcription.
  - Hugging Face Transformers for text summarization and question generation.
  - yt-dlp for downloading videos.

## Installation

### Prerequisites
- Python 3.x
- Node.js and npm
- MongoDB

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/sufiyanmanihar747/video-summarizer.git
   cd video-summarizer/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up your MongoDB database and update the connection string in the configuration file.

5. Set up Google Cloud credentials for the Speech-to-Text API and any other required APIs.

6. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## Usage
1. Open your web browser and navigate to `http://localhost:3000`.
2. Register or log in to your account.
3. Upload a video URL to process it.
4. View the generated summary and questions in your history.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [Google Cloud](https://cloud.google.com/speech-to-text) for the Speech-to-Text API.
- [Hugging Face](https://huggingface.co/) for the Transformers library.
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for video downloading capabilities.

## Contact
For any inquiries, please contact [your-email@example.com](mailto:your-email@example.com).
