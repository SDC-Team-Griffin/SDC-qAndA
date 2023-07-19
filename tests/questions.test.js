// NOTE: none of positive tests passing (for some reason) —> investigate further

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
        product_id: 40360,
        page: 1,
        count: 1
      },
      body: {
        product_id: 40360,
        body: 'you suck nerd?',
        name: 'Jimmy Neutron',
        email: 'john@test.com'
      },
      params: { question_id: 142036 }
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
      /*
      mockReq = {
        query: {
          product_id: 40360,
          page: 1,
          count: 10
        }
      };
      */

      const mockQuestionRows = [
        {
          question_id: 142036,
          question_body: 'Voluptas veritatis maiores quos.',
          question_date: '1610799467854',
          asker_name: 'Elenora72',
          question_helpfulness: 15,
          reported: false,
          answers: [
            {
              answer_id: 277363,
              body: 'Placeat porro est molestias voluptate possimus quas.',
              date: '1607111473735',
              answerer_name: 'Wendell_Veum',
              helpfulness: 18,
              photos: [{ id: null, url: null }]
            },
            /*
            {
              answer_id: 277364,
              body: 'Suscipit provident exercitationem et temporibus.',
              date: '1589612721089',
              answerer_name: 'Antonina1',
              helpfulness: 0,
              photos: [{ id: null, url: null }]
            },
            {
              answer_id: 277365,
              body: 'Temporibus voluptatibus in.',
              date: '1595904222266',
              answerer_name: 'Johathan.Bruen',
              helpfulness: 17,
              photos: [
                {
                  id: 83246,
                  url: 'https://images.unsplash.com/photo-1519862170344-6cd5e49cb996?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80'
                }
              ]
            },
            {
              answer_id: 277366,
              body: 'Omnis magni ex ex modi.',
              date: '1610235862813',
              answerer_name: 'Antonietta58',
              helpfulness: 19,
              photos: [{ id: null, url: null }]
            },
            {
              answer_id: 6879307,
              body: 'you suck nerd!',
              date: '1689707350',
              answerer_name: 'jackson420',
              helpfulness: 0,
              photos: [{ id: null, url: null }]
            }
            */
          ]
        }
      ];
      db.query.mockResolvedValue({ rows: mockQuestionRows });

      // make mockReq
      await GET(mockReq, mockRes);

      // assertions
      expect(mockRes.status).toHaveBeenCalledWith(200);

      expect(mockRes.json).toHaveBeenCalledWith({
        product_id: mockReq.query.product_id,
        results: [
          {
            question_id: 142036,
            question_body: 'Voluptas veritatis maiores quos.',
            question_date: '1610799467854',
            asker_name: 'Elenora72',
            question_helpfulness: 15,
            reported: false,
            answers: [
              {
                answer_id: 277363,
                body: 'Placeat porro est molestias voluptate possimus quas.',
                date: '1607111473735',
                answerer_name: 'Wendell_Veum',
                helpfulness: 18,
                photos: [{ id: null, url: null }]
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
      // expect(mockRes.status).toHaveBeenCalledWith(201);

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