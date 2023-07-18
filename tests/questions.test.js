const { GET, POST, PUT } = require('../server/controllers/questions');

jest.mock('../db', () => ({
  query: jest.fn()
}));

const mockDB = require('../db');

const mockReq = {
  query: {
    product_id: '69',
    page: 1,
    count: 10
  },
  body: {
    product_id: '123',
    body: 'Test',
    name: 'John Doe',
    email: 'john@test.com'
  },
  params: {
    question_id: '420'
  }
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
};

describe('GET', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  });

  test('fetch questions', async() => {
    // mock res of db query
    const result = {
      rows: [{ question_id: 1, question_body: 'Q1' }]
    };
    mockDB.query = jest.fn().mockResolvedValue(result);

    const { product_id, count } = mockReq.query;

    await GET(mockReq, mockRes);

    // assertions
    expect(mockRes.status).toHaveBeenCalledWith(200);

    expect(mockRes.json).toHaveBeenCalledWith({
      product_id: '69',
      results: result.rows
    });

    expect(mockDB.query).toHaveBeenCalledTimes(1);

    expect(mockDB.query).toHaveBeenCalledWith(
      expect.any(String), [ product_id, count, expect.any(Number) ]
    );
  });
});