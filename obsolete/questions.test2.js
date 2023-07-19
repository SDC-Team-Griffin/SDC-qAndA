const req = require('supertest');
const app = require('../server/server.js');
const db = require('../db');

describe('Questions API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {

    test('fetches questions & their answers', async() => {
      // copied from DB
      const mockQueryResult = {
        rows: [
          {
            question_id: 142036,
            question_body: 'Voluptas veritatis maiores quos.',
            question_date: '1610799467854',
            asker_name: 'Elenora72',
            question_helpfulness: 15,
            reported: false,
            answers: []
          }
        ]
      };

      const mockQueryAnswerResult = {
        rows: [
          {
            answer_id: 277363,
            body: 'Placeat porro est molestias voluptate possimus quas.',
            date: '1607111473735',
            answerer_name: 'Wendell_Veum',
            helpfulness: 18,
            photos: [{ id: null, url: null }]
          },
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
        ]
      };

      db.query.mockResolvedValueOnce(mockQueryResult);
      db.query.mockResolvedValueOnce(mockQueryAnswerResult);

      const res = await req(app).get('/questions')
        .query({
          product_id: '40360',
          page: 1,
          count: 1
        });

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        product_id: '40360',
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
              },
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
            ]
          }
        ]
      });

      expect(db.query).toHaveBeenCalledTimes(2);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String), [ '40360', 10, 0 ]
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String), [ 142036 ]
      );
    });

    test('handles errors when fetching', async() => {
      const err = new Error('Error fetching questions');
      db.query.mockRejectedValueOnce(err);

      const res = await req(app).get('/questions')
        .query({
          product_id: '40360',
          page: 1,
          count: 10
        });

      expect(res.status).toBe(500);

      expect(res.body).toEqual({
        error: 'Error fetching questions for product: 40360'
      });

      expect(db.query).toHaveBeenCalledTimes(1);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), ['40360', 10, 0]);
    });

    // ... other test cases
  });

  // ... other endpoint tests
});
