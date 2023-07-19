const { GET, POST, UPVOTE, REPORT } = require('../server/controllers/answers');
const db = require('../db');

describe('Answers API', () => {

  const mockReq = {
    query: {
      page: 1,
      count: 1
    },
    params: {
      question_id: 1
    },
    body: {
      body: 'test',
      name: 'Bob',
      email: 'bob@test.com',
      photos: [
        {
          id: 1,
          url: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/SpongeBob_SquarePants_character.svg/1200px-SpongeBob_SquarePants_character.svg.png'
        }
      ]
    }
  };
  const mockRes = {
    //
  };

  beforeEach(() => {
    mockReq =
  });
})

/*
describe('Questions API', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /qa/questions', () => {

    test('fetch questions', async() => {
      const req = { query:
        { product_id: 1, page: 1, count: 10 }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // MOCK POSITIVE RESULT
      const mockRes = {
        rows: [
          {
            "id": 420,
            "product_id": 1,
            "body": "ur mum lol",
            "date_written": "1595872277040",
            "asker_name": "spongebob69",
            "asker_email": "sq4rep4nts@hotmail.com",
            "reported": 1,
            "helpful": 25
          }
        ]
      };

      db.query = jest.fn().mockResolvedValue(mockRes);

      await questions.GET(req, res);

      // VERIFY
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String), [1, 10, 0]
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        mockRes.rows
      );
    });

    test('handle errors when fetching questions', async() => {
      const req = { query:
        { product_id: 1, page: 1, count: 10 }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // MOCK NEGATIVE RESULT
      db.query = jest.fn().mockRejectedValue(
        new Error('Error fetching questions from DB')
      );

      await questions.GET(req, res);

      // VERIFY
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String), [ 1, 10, 0 ]
      );

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Error fetching questions for product: 1'
      });
    });
  });

  describe('PUT /qa/questions/:question_id/helpful', () => {

    test('update question helpfulness', async() => {
      const req = { params: { question_id: 123 } };

      const res = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn()
      };

      db.query = jest.fn().mockResolvedValue();

      await questions.UPVOTE(req, res);

      // VERIFY
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String), [ req.params.question_id ]
      );

      expect(res.status).toHaveBeenCalledWith(204);

      expect(res.end).toHaveBeenCalledWith();
    });

    test('handle errors when updating helpfulness', async() => {
      const req = { params: { question_id: 123 } };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.query = jest.fn().mockRejectedValue(
        new Error('Error updating questions in DB')
      );

      await questions.UPVOTE(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String), [ req.params.question_id ]
      );

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        error: `Error upvoting question: ${ req.params.question_id }`
      });
    });
  });
});
*/