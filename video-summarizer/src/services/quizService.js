import api from '../utilities/api';

export async function generateQuestions(text) {
  try {
    console.log('Sending text to generate questions:', text.substring(0, 100) + '...');
    
    const response = await api.post('/generate_questions', {
      text,
      num_questions: 3
    });

    console.log('Response from server:', response.data);

    if (!response.data.questions || !Array.isArray(response.data.questions)) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from server');
    }

    // Validate question format
    const validQuestions = response.data.questions.filter(q => 
      q && 
      typeof q.question === 'string' && 
      Array.isArray(q.options) && 
      q.options.length > 0 &&
      typeof q.correct_answer === 'number'
    );

    console.log('Valid questions:', validQuestions);

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    return validQuestions;

  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
} 