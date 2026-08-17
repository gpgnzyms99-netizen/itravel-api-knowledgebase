import { API_KNOWLEDGE_BASE, QUIZ_QUESTIONS } from '../src/data/apiData';

describe('iTravel API Knowledge Base Dataset Verification', () => {
  test('API dataset contains expected endpoints', () => {
    expect(API_KNOWLEDGE_BASE.length).toBeGreaterThan(5);
  });

  test('Quiz question dataset is formatted correctly', () => {
    expect(QUIZ_QUESTIONS.length).toBe(5);
    QUIZ_QUESTIONS.forEach(q => {
      expect(q.options.length).toBe(4);
      expect(typeof q.correctAnswer).toBe('number');
    });
  });
});
