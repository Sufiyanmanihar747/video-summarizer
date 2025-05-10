import React, { useState, useEffect } from 'react';
import { generateQuestions } from '../services/quizService';
import './Quiz.css';

function Quiz({ transcription }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (transcription) {
      loadQuestions();
    }
  }, [transcription]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const generatedQuestions = await generateQuestions(transcription);
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
      } else {
        setError('No questions were generated. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    // Update score
    if (selectedAnswer === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setScore(0);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Generating quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <i className="fas fa-exclamation-circle"></i>
          <p>Failed to generate questions: {error}</p>
          <button className="retry-btn" onClick={loadQuestions}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <i className="fas fa-exclamation-circle"></i>
          <p>No questions available. Please try again.</p>
          <button className="retry-btn" onClick={loadQuestions}>
            <i className="fas fa-redo"></i> Generate Questions
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <h2>Quiz Results</h2>
          <div className="score-display">
            <div className="score-circle">
              <span>{Math.round((score / questions.length) * 100)}%</span>
            </div>
            <p>You got {score} out of {questions.length} questions correct!</p>
          </div>
          <button className="restart-btn" onClick={restartQuiz}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  if (!currentQuestionData || !currentQuestionData.options) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <i className="fas fa-exclamation-circle"></i>
          <p>Question data is invalid. Please try again.</p>
          <button className="retry-btn" onClick={loadQuestions}>
            <i className="fas fa-redo"></i> Generate New Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Knowledge Check</h2>
        <span className="question-counter">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <p className="question-text">{currentQuestionData.question}</p>
          <div className="options-list">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-actions">
          <button 
            className="next-btn"
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz; 