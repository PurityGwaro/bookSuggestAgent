import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const BOOKS_LIMIT = 5;
const OPEN_LIBRARY_API = 'https://openlibrary.org/subjects';

const suggestionSchema = z.object({
  title: z.string(),
  author: z.string(),
  link: z.string(),
});

const formatBookSuggestion = (work: any) => {
  if (!work?.title || !work?.authors?.[0]?.name || !work?.key) {
    return null;
  }

  return {
    title: work.title,
    author: work.authors[0].name,
    link: `https://openlibrary.org${work.key}`,
  };
};

const fetchBookSuggestions = createStep({
  id: 'fetch-book-suggestions',
  description: 'Fetch book suggestions for a topic',
  inputSchema: z.object({
    topic: z.string().describe('The topic to get books for'),
  }),
  outputSchema: z.object({
    suggestions: z.array(suggestionSchema),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Missing topic input');

    const cleanedTopic = inputData.topic
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/gi, ' ')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
    
    const encodedTopic = encodeURIComponent(cleanedTopic);
    
    const response = await fetch(
      `${OPEN_LIBRARY_API}/${encodedTopic}.json?limit=10`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch book suggestions');
    }

    const data = await response.json();
    
    if (!data.works || data.works.length === 0) {
      throw new Error(`No books found for "${inputData.topic}"`);
    }

    const suggestions =
      data.works
        ?.map(formatBookSuggestion)
        .filter(Boolean)
        .slice(0, BOOKS_LIMIT) || [];

    return { suggestions };
  },
});

const bookSuggestWorkflow = createWorkflow({
  id: 'book-suggest-workflow',
  inputSchema: z.object({
    topic: z.string(),
  }),
  outputSchema: z.object({
    suggestions: z.array(suggestionSchema),
  }),
}).then(fetchBookSuggestions);

bookSuggestWorkflow.commit();

export { bookSuggestWorkflow };