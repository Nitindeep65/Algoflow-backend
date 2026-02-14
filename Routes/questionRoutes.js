import express from 'express';
import { createQuestions, getQuestions, getQuestionById } from '../Controllers/questionsController.js';

const router = express.Router();

router.post('/createQuestions', createQuestions);
router.get('/getQuestions', getQuestions);
router.get('/getQuestion/:id', getQuestionById);

export default router;