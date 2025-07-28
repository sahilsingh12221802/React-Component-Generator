const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet';
    this.baseURL = 'https://openrouter.ai/api/v1';
  }

  async generateComponent(prompt, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL,
            'X-Title': 'AI Component Generator'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseComponentResponse(content);
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error('Failed to generate component. Please try again.');
    }
  }

  async generateComponentStream(prompt, context = {}, onChunk) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL,
            'X-Title': 'AI Component Generator'
          },
          responseType: 'stream'
        }
      );

      let fullContent = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onChunk(null, { done: true, content: fullContent });
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                fullContent += content;
                onChunk(content, { done: false });
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      });

      response.data.on('end', () => {
        const result = this.parseComponentResponse(fullContent);
        onChunk(null, { done: true, content: fullContent, result });
      });

    } catch (error) {
      console.error('AI Stream Error:', error.response?.data || error.message);
      onChunk(null, { error: 'Failed to generate component. Please try again.' });
    }
  }

  async refineComponent(prompt, currentComponent, context = {}) {
    try {
      const systemPrompt = this.buildRefinementPrompt(currentComponent, context);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 4000,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL,
            'X-Title': 'AI Component Generator'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseComponentResponse(content);
    } catch (error) {
      console.error('AI Refinement Error:', error.response?.data || error.message);
      throw new Error('Failed to refine component. Please try again.');
    }
  }

  buildSystemPrompt(context = {}) {
    return `You are an expert React component generator. Create modern, responsive React components based on user descriptions.

IMPORTANT RULES:
1. Always return ONLY valid JSX/TSX code and CSS
2. Use modern React patterns (functional components, hooks)
3. Make components responsive and accessible
4. Use Tailwind CSS for styling when possible
5. Include proper TypeScript types if requested
6. Ensure components are self-contained and reusable
7. Add proper ARIA attributes for accessibility
8. Use semantic HTML elements
9. Include hover states and transitions where appropriate
10. Make sure the component is production-ready

FORMAT YOUR RESPONSE AS:
\`\`\`jsx
// JSX/TSX code here
\`\`\`

\`\`\`css
/* CSS styles here */
\`\`\`

Context: ${JSON.stringify(context)}

Generate a component that matches the user's description exactly.`;
  }

  buildRefinementPrompt(currentComponent, context = {}) {
    return `You are an expert React component refiner. Modify the existing component based on the user's request.

CURRENT COMPONENT:
\`\`\`jsx
${currentComponent.jsx || ''}
\`\`\`

\`\`\`css
${currentComponent.css || ''}
\`\`\`

IMPORTANT RULES:
1. Only modify what the user specifically requests
2. Maintain the existing structure and functionality
3. Keep the component responsive and accessible
4. Use Tailwind CSS for styling when possible
5. Ensure the component remains self-contained
6. Preserve existing props and interfaces

Context: ${JSON.stringify(context)}

Return the updated component in the same format:
\`\`\`jsx
// Updated JSX/TSX code
\`\`\`

\`\`\`css
/* Updated CSS styles */
\`\`\``;
  }

  parseComponentResponse(content) {
    try {
      const jsxMatch = content.match(/```(?:jsx|tsx|javascript)?\s*([\s\S]*?)```/);
      const cssMatch = content.match(/```css\s*([\s\S]*?)```/);
      
      let jsx = '';
      let css = '';
      
      if (jsxMatch) {
        jsx = jsxMatch[1].trim();
      }
      
      if (cssMatch) {
        css = cssMatch[1].trim();
      }
      
      // If no CSS block found, try to extract CSS from the JSX
      if (!css && jsx) {
        const styleMatch = jsx.match(/style\s*=\s*{`([\s\S]*?)`}/);
        if (styleMatch) {
          css = styleMatch[1].trim();
        }
      }
      
      return {
        jsx: jsx || '',
        css: css || '',
        raw: content
      };
    } catch (error) {
      console.error('Component parsing error:', error);
      return {
        jsx: '',
        css: '',
        raw: content,
        error: 'Failed to parse component response'
      };
    }
  }

  async validateComponent(jsx, css) {
    // Basic validation - in production, you might want more sophisticated validation
    const hasJSX = jsx && jsx.trim().length > 0;
    const hasValidJSX = hasJSX && (jsx.includes('return') || jsx.includes('export'));
    
    return {
      isValid: hasValidJSX,
      errors: hasValidJSX ? [] : ['Invalid JSX structure'],
      warnings: []
    };
  }
}

module.exports = new AIService(); 