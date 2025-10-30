// test-book-tool.mjs
import { bookSuggestTool } from './src/mastra/tools/book-suggest-tool.js'; // Note the .js extension

async function testBookSuggestion(topic) {
  try {
    console.log(`Fetching book suggestions for: ${topic}`);
    const result = await bookSuggestTool.execute({ context: { topic } });
    console.log('Suggestions:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const topic = process.argv[2] || 'science';
testBookSuggestion(topic);