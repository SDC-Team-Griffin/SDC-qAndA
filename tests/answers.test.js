const db = require('../db');
const { GET, POST, UPVOTE, REPORT } = require('../server/controllers/answers');

// let mockReq;
// let mockRes;

describe('Answers', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {

    test('fetches answers & returns JSON res', async() => {
      const mockReq = {
        params: { question_id: 1 },
        query: { page: 1, count: 10 }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockQueryResult = {
        rows: [
          // mock answer objects
        ]
      };

      const mockQuery = jest.spyOn(db, 'query').mockResolvedValue(mockQueryResult);

      await GET(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 10, 0]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        question: 1,
        page: 1,
        count: 10,
        results: expect.any(Array)
      }));
    });

    test('handles errors & returns JSON res w/ error message', async() => {
      const mockReq = {
        params: {
          question_id: 1
        },
        query: {
          page: 1,
          count: 10
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error('Database error');
      const mockQuery = jest.spyOn(db, 'query').mockRejectedValue(mockError);

      await GET(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 10, 0]);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('POST', () => {
    test('inserts new answer & return JSON res', async() => {
      const mockReq = {
        params: {
          question_id: 1
        },
        body: {
          body: 'Test answer',
          name: 'John Doe',
          email: 'john@example.com',
          photos: []
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockQueryResult = {
        rows: [
          { id: 123 } // mock inserted answer ID
        ]
      };

      const mockQuery = jest.spyOn(db, 'query').mockResolvedValueOnce(mockQueryResult);

      await POST(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 'Test answer', 'John Doe', 'john@example.com']);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String)
      }));
    });

    test('inserts new answer w/ photos & returns JSON res', async() => {
      const mockReq = {
        params: {
          question_id: 1
        },
        body: {
          body: 'Test answer',
          name: 'John Doe',
          email: 'john@example.com',
          photos: ['photo1.jpg', 'photo2.jpg']
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockQueryResult = {
        rows: [
          { id: 123 } // mock inserted answer ID
        ]
      };

      const mockQuery = jest.spyOn(db, 'query')
        .mockResolvedValueOnce(mockQueryResult)
        .mockResolvedValueOnce(null); // mock the second query for inserting photos

      await POST(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 'Test answer', 'John Doe', 'john@example.com']);
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [123, 'photo1.jpg', 123, 'photo2.jpg']);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String)
      }));
    });

    test('handles errors & returns JSON res w/ error message', async() => {
      const mockReq = {
        params: {
          question_id: 1
        },
        body: {
          body: 'Test answer',
          name: 'John Doe',
          email: 'john@example.com',
          photos: []
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error('Database error');
      const mockQuery = jest.spyOn(db, 'query').mockRejectedValue(mockError);

      await POST(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [1, 'Test answer', 'John Doe', 'john@example.com']);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('UPVOTE', () => {
    test('increment helpfulness & returns 204 status', async() => {
      const mockReq = {
        params: {
          answer_id: 123
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn()
      };

      const mockQuery = jest.spyOn(db, 'query').mockResolvedValueOnce();

      await UPVOTE(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [123]);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('handle errors & returns JSON res w/ error message', async() => {
      const mockReq = {
        params: {
          answer_id: 123
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error('Database error');
      const mockQuery = jest.spyOn(db, 'query').mockRejectedValue(mockError);

      await UPVOTE(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [123]);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe('REPORT', () => {
    test('marks answer as reported & returns 204 status', async() => {
      const mockReq = {
        params: {
          answer_id: 123
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn()
      };

      const mockQuery = jest.spyOn(db, 'query').mockResolvedValueOnce();

      await REPORT(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [123]);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('handle errors & returns JSON res w/ error message', async() => {
      const mockReq = {
        params: {
          answer_id: 123
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error('Database error');
      const mockQuery = jest.spyOn(db, 'query').mockRejectedValue(mockError);

      await REPORT(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [123]);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });
});
