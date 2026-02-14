const analyzeCodeWithAI = async (req, res) => {
  try {
    const { code, question, language } = req.body;

    if (!code || !question) {
      return res.status(400).json({ error: 'Code and question are required' });
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        error: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your .env file' 
      });
    }

    const prompt = `You are an expert code reviewer and programming tutor. Analyze the following code submission for a coding problem.

**Problem:**
Title: ${question.title}
Description: ${question.description}
${question.constraints ? `Constraints: ${question.constraints}` : ''}

**User's Code (${language}):**
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis with:

1. **Issues**: Identify specific bugs, logical errors, or problems. Be concise and clear. Use code snippets with \`backticks\` for variable/function names. Number issues if multiple exist.

2. **Suggestions**: Provide actionable recommendations to fix the issues. Include code examples using markdown code blocks (\`\`\`${language}) when showing solutions. Use **bold** for emphasis on key concepts.

3. **Explanation**: Provide a clear, well-structured explanation of:
   - What the code does correctly
   - Why the issues exist
   - How to improve the solution
   - Time/space complexity analysis if relevant
   
Use proper formatting:
- **Bold** for important terms and concepts
- \`code\` for inline code references
- \`\`\`${language} for multi-line code blocks
- Clear paragraphs with line breaks

Format your response as JSON with this structure:
{
  "issues": ["issue 1 with proper formatting", "issue 2 with proper formatting", ...],
  "suggestions": ["suggestion 1 with code examples", "suggestion 2 with code examples", ...],
  "explanation": "detailed explanation with proper formatting and structure"
}

Be constructive, educational, and professional. Help the user understand what's wrong and how to fix it.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and programming tutor. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to analyze code with AI',
        details: errorData 
      });
    }

    const data = await response.json();
    
    // Extract the AI response
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    let analysis;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanResponse);
    } catch (parseError) {
      analysis = {
        issues: [],
        suggestions: [],
        explanation: aiResponse
      };
    }

    res.json({ 
      success: true,
      analysis 
    });

  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ 
      error: 'Internal server error while analyzing code',
      message: error.message 
    });
  }
};

export { analyzeCodeWithAI };
