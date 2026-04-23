import { Request, Response, NextFunction } from 'express';
import Groq from 'groq-sdk';
import { BadRequestError } from '../utils/errors';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function aiComplete(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt, context, action } = req.body;
    if (!prompt) throw new BadRequestError('Prompt is required');

    const systemPrompts: Record<string, string> = {
      continue: 'You are a helpful writing assistant. Continue the text naturally, maintaining the same style, tone, and format. Only output the continuation, not the original text.',
      improve: 'You are an expert editor. Improve the given text for clarity, conciseness, and professionalism. Return only the improved version.',
      summarize: 'You are a summarization expert. Create a concise summary of the given text. Return only the summary.',
      fix_grammar: 'You are a grammar expert. Fix all grammar, spelling, and punctuation errors. Return only the corrected text.',
      explain: 'You are a technical writer. Explain the given code or concept in simple terms.',
      generate_code: 'You are an expert programmer. Generate clean, well-commented code based on the description. Return only the code.',
    };

    const systemPrompt = systemPrompts[action || 'continue'] || systemPrompts.continue;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(context ? [{ role: 'user' as const, content: `Context:\n${context}` }] : []),
        { role: 'user', content: prompt },
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
