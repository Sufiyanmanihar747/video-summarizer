import React, { useState } from 'react';
import './GeminiQuiz.css';

function GeminiQuiz({ questions, onClose }) {

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Ensure questions is an array with at least one item
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="gemini-quiz-modal">
        <div className="quiz-content">
          <h2>Error</h2>
          <p>No questions available.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }


  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="gemini-quiz-modal">
        <div className="quiz-content">
          <h2>Quiz Results</h2>
          <div className="results">
            <p>Your Score: {score} out of {questions.length}</p>
            <div className="question-review">
              {questions.map((question, index) => (
                <div key={index} className="review-item">
                  <p className="question">{question?.question}</p>
                  <div className="options-review">
                    {question?.options?.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`option ${
                          optIndex === question.correct_answer ? 'correct' : ''
                        } ${
                          selectedAnswers[index] === optIndex ? 'selected' : ''
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <p className="explanation">{question?.explanation}</p>
                </div>
              ))}
            </div>
            <div className="result-actions">
              <button onClick={resetQuiz}>Try Again</button>
              <button onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safely access the current question using optional chaining
  const currentQ = questions?.[currentQuestion];

  return (
    <div className="gemini-quiz-modal">
      <div className="quiz-content">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="question-container">
          <h3>{currentQ?.question || 'Question not available'}</h3>
          <div className="options">
            {currentQ?.options?.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedAnswers[currentQuestion] === index ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
              >
                {option}
              </button>
            )) || <p>No options available</p>}
          </div>
        </div>
        <div className="quiz-actions">
          <button
            className="next-button"
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion < questions.length - 1 ? 'Next' : 'Show Results'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeminiQuiz;
