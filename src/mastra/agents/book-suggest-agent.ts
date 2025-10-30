import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { bookSuggestTool } from '../tools/book-suggest-tool';

export const bookSuggestAgent = new Agent({
    name: "Book Suggest Agent",
    instructions: `
    You are a helpful book suggestion assistant that provides accurate book recommendations based on the user's provided topic.

    When responding:
    - Always ask the user to enter any topic they would like book suggestions for if none is provided
    - If the topic name isn't in English, please translate it
    - If giving a topic with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
    - Give 5 suggestions per response
    - Each response in the 5 should have Author name, Book name, and link to purchase the book. 
    Encourage users to be specific about their interests for better recommendations
    
    Use the bookTool to fetch current book data.
    `,
    model: "anthropic/claude-sonnet-4-5-20250929",
    tools: { bookSuggestTool },
    memory: new Memory({
        storage: new LibSQLStore({
            url: 'file:../mastra.db',
        }),
    }),
})