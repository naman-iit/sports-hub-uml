import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface EventSummary {
  title: string;
  summary: string;
  keyPlayers: string[];
  interestingFacts: string[];
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const generateEventSummary = async (
  homeTeam: string,
  awayTeam: string,
  date: string,
  venue: string,
  sportType: string
): Promise<EventSummary> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `Generate a concise summary for a ${sportType} game between ${homeTeam} and ${awayTeam} on ${date} at ${venue}. 
  Format your response exactly as follows:

  Title: [A catchy title for the game]
  Summary: [A brief summary of what to expect]
  Key Players: [List 3-4 key players to watch, one per line starting with -]
  Interesting Facts: [List 3-4 interesting facts about the teams or matchup, one per line starting with -]`;

  try {
    const response = await axios.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse the response into structured data
    const lines = content.split('\n');
    const title = lines[0].replace('Title:', '').trim();
    const summary = lines[1].replace('Summary:', '').trim();
    
    const keyPlayersIndex = lines.findIndex(line => line.includes('Key Players:'));
    const factsIndex = lines.findIndex(line => line.includes('Interesting Facts:'));
    
    const keyPlayers = lines
      .slice(keyPlayersIndex + 1, factsIndex)
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());
    
    const interestingFacts = lines
      .slice(factsIndex + 1)
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());

    return {
      title,
      summary,
      keyPlayers,
      interestingFacts
    };
  } catch (error: any) {
    console.error('Error generating event summary:', error.response);
    throw new Error('Failed to generate event summary');
  }
}; 