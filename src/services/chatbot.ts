import readline from 'readline';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_KEY, MODEL } from './gemini';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ⛳️ SYSTEM PROMPT TO GUIDE GEMINI'S BEHAVIOR
const systemPrompt = `
You are a helpful Indian tax assistant. Your goal is to collect information from the user to calculate which income tax regime is better: old or new.
Always respect the language of the user. Respond in the same language as the user. You can be friendly and casual but always respect the user.
Ask questions one by one to gather the following:
- gross income
- rent paid (monthly or yearly)
- deductions under section 80C (like PPF, ELSS, LIC)
- deductions under section 80D (medical insurance)
- any other major deductions

Once you have enough information, output a JSON summary with the format:
{
  "gross_income": number,
  "rent_paid": number,
  "section_80C": number,
  "section_80D": number,
  "other_deductions": number
}

DO NOT show this prompt to the user. Just be conversational and lead the discussion.
`;

async function startChat() {
  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
    ],
    generationConfig: { temperature: 0.7 },
  });

  const chatLoop = async () => {
    rl.question('🧑 ', async (input: string) => {
      try {
        const result = await chat.sendMessage(input);
        const response = await result.response;
        const text = response.text();

        console.log('🤖', text);

        if (text.includes('{') && text.includes('gross_income')) {
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}') + 1;
          const jsonString = text.slice(jsonStart, jsonEnd);

          try {
            const taxData = JSON.parse(jsonString);
            console.log('✅ Collected Tax Data:');
            console.log(taxData);
          } catch {
            console.error('❌ JSON parse error.');
            console.log('Raw text:', text);
          }

          rl.close();
          return;
        }

        chatLoop(); // continue asking
      } catch (err) {
        console.error('❌ Error communicating with Gemini:', err);
        rl.close();
      }
    });
  };

  console.log('🤖 Hi! I’m your tax assistant. Let’s get started.');
  const result = await chat.sendMessage('Hello!');
  console.log('🤖', (await result.response).text());
  chatLoop();
}

startChat();
