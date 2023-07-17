const express = require('express');
const router = express.Router();

const { GET, POST, UPVOTE, REPORT } = require('../controllers/answers');

// NOTE: must explicitly include params for route handler **
router.get('/:question_id/answers', GET);
router.post('/:question_id/answers', POST);

router.put('/:answer_id/helpful', UPVOTE);
router.put('/:answer_id/report', REPORT);

module.exports = router;