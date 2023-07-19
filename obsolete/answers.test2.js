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
*/