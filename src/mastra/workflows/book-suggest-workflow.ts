import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const BOOKS_LIMIT = 5;
const OPEN_LIBRARY_API = 'https://openlibrary.org/subjects';

const suggestionSchema = z.object({
  title: z.string(),
  author: z.string(),
  link: z.string(),
});

/**
 * Format book response object
 */
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

/**
 * Step: Fetch Books From API
 */
const fetchBookSuggestions = createStep({
  id: 'fetch-book-suggestions',
  description: 'Fetch 5 book suggestions for a topic',
  inputSchema: z.object({
    topic: z.string().describe('The topic to get books for'),
  }),
  outputSchema: z.object({
    suggestions: z.array(suggestionSchema),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error('Missing topic input');

    const encodedTopic = encodeURIComponent(inputData.topic.toLowerCase().trim());

    const response = await fetch(
      `${OPEN_LIBRARY_API}/${encodedTopic}.json?limit=${BOOKS_LIMIT}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch book suggestions');
    }

    const data = await response.json();

    const suggestions =
      data.works
        ?.map(formatBookSuggestion)
        .filter(Boolean)
        .slice(0, BOOKS_LIMIT) || [];

    return { suggestions };
  },
});

/**
 * Workflow only has 1 step for now
 */
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
