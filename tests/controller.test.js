const db = require('../db');
const { questions, answers } = require('../server/controller');

describe('Questions API', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /qa/questions', () => {

    test('fetch questions', async() => {
      const req = { query: { product_id: 1, page: 1, count: 10 } };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // MOCK POSITIVE RESULT
      db.query = jest.fn().mockResolvedValue({
        rows: [
          {
            "id": 142038,
            "product_id": 40361,
            "body": "Ex et voluptas quisquam dolores voluptate fuga earum nihil.",
            "date_written": "1595872277040",
            "asker_name": "Elnora79",
            "asker_email": "Ellsworth93@hotmail.com",
            "reported": 1,
            "helpful": 25
          },
        ]
      });

      await questions.GET(req, res);

      // VERIFY
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        expect.any(Array)
      );
    });

    test('handle errors when fetching questions', async() => {
      const req = { query: { product_id: 1, page: 1, count: 10 } };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // MOCK NEGATIVE RESULT
      db.query = jest.fn().mockRejectedValue(
        new Error('Error fetching questions from DB!')
      );

      await questions.GET(req, res);

      // VERIFY
      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Error fetching questions for product: 1'
      });
    });
  });
});