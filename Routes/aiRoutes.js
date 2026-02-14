import express from 'express';
import { analyzeCodeWithAI } from '../Controllers/aiController.js';

const router = express.Router();

router.post('/analyze-code', analyzeCodeWithAI);

export default router;
