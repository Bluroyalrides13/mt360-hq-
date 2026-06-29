const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const MT360_SYSTEM = `You are the AI content assistant for MultiTask360, a brand built by Cindy Murphy that helps multi-passionate entrepreneurs discover hidden income streams and turn their life experiences into additional revenue. The brand speaks to people who are already doing a lot — working multiple roles, raising families, running side hustles — and shows them how to monetize what they already know. Brand voice: empowering, direct, bilingual (English and Spanish), warm but results-focused. Key CTAs: "DM me MULTITASK" and "DM me INCOME". Instagram: @multitask360. Products: Hidden Income Finder (free lead magnet), DIY Course, Mini Launch Kit. Content rotation: Monday=Teach, Wednesday=Trust, Friday=Sell.`;

// Streaming endpoint
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: MT360_SYSTEM,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      res.write(`data: ${JSON.stringify({ error: err.error?.message || 'API error' })}\n\n`);
      return res.end();
    }

    response.body.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') { res.write('data: [DONE]\n\n'); continue; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
            }
          } catch (e) {}
        }
      }
    });

    response.body.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.body.on('error', () => {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.end();
    });

  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'Server error: ' + err.message })}\n\n`);
    res.end();
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`MT360 HQ running on port ${PORT}`);
});
