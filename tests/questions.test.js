const db = require('../db');
const { GET, POST, UPVOTE, REPORT } = require('../server/controllers/questions');

jest.mock('../db', () => ({
  query: jest.fn()
}));

let mockReq;
let mockRes;

describe('Questions API', () => {

  beforeEach(() => {
    mockReq = {
      query: {
        product_id: 123,
        page: 1,
        count: 10
      },
      body: {
        product_id: 123,
        body: 'Q body',
        name: 'John',
        email: 'john@test.com'
      },
      params: { question_id: 456 }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {

    test('fetches questions & their answers', async() => {
      const mockQuestionRows = [
        {
          question_id: 1,
          question_body: 'Q1',
          // other question props (omitted for time)
        },
        {
          question_id: 2,
          question_body: 'Q2',
          // other question props (omitted for time)
        }
      ];

      const mockAnswerRows = [
        {
          answer_id: 1,
          body: 'A1',
          // other answer props (omitted for time)
        },
        {
          answer_id: 2,
          body: 'A2',
          // other answer props (omitted for time)
        }
      ];

      db.query.mockResolvedValue({ rows: mockQuestionRows });
      db.query.mockResolvedValue({ rows: mockAnswerRows });

      // make mockReq
      await GET(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(200);

      expect(mockRes.json).toHaveBeenCalledWith({
        product_id: mockReq.query.product_id,
        results: [
          {
            question_id: 1,
            question_body: 'Q1',
            answers: [
              {
                answer_id: 1,
                body: 'A1'
              }
            ]
          },
          {
            question_id: 2,
            question_body: 'Q2',
            answers: [
              {
                answer_id: 2,
                body: 'A2'
              }
            ]
          }
        ]
      });
    });

    test('handles errors when fetching', async() => {
      const err = 'Error fetching questions';
      db.query.mockRejectedValue(new Error(err));

      await GET(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(500);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: `Error fetching questions for product: ${ mockReq.query.product_id }`
      });
    });
  });

  describe('POST', () => {

    test('posts question', async() => {
      await POST(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(201);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Question posted!'
      });
    });

    test('handles errors when posting', async() => {
      const err = 'Error posting question';
      db.query.mockRejectedValue(new Error(err));

      await POST(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(500);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: `Error posting question: ${ mockReq.body.body }`
      });
    });
  });

  describe('UPVOTE', () => {

    test('updates helpfulness', async() => {
      await UPVOTE(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(204);

      expect(mockRes.end).toHaveBeenCalled();
    });

    test('handles errors when upvoting', async() => {
      const err = 'Error upvoting question';
      db.query.mockRejectedValue(new Error(err));

      await UPVOTE(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(500);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: `Error upvoting question: ${ mockReq.params.question_id }`
      });
    });
  });

  describe('REPORT', () => {

    test('reports question', async() => {
      await REPORT(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(204);

      expect(mockRes.end).toHaveBeenCalled();
    });

    test('handles errors when reporting', async() => {
      const err = 'Error reporting question';
      db.query.mockRejectedValue(new Error(err));

      await REPORT(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(500);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: `Error reporting question: ${ mockReq.params.question_id }`
      });
    });
  });
});