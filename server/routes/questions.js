const express = require('express');
const router = express.Router();

const { GET, POST, UPVOTE, REPORT } = require('../controller').questions;

router.get('/', GET);
router.post('/', POST);
router.put('/:question_id/helpful', UPVOTE);
router.put('/:question_id/report', REPORT);

module.exports = router;