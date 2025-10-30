import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const bookSuggestTool = createTool({
    id: 'get-book-suggestions',
    description: 'Get 5 book suggestions for a given topic',
    inputSchema: z.object({
        topic: z.string().describe('Topic name'),
    }),
    outputSchema: z.object({
        suggestions: z.array(z.object({
            author: z.string(),
            title: z.string(),
            link: z.string(),
        })),
    }),
    execute: async ({ context }) => {
    const suggestions = await getBookSuggestions(context.topic);
    return { suggestions };
},
});

interface BookSuggestion {
    author: string;
    title: string;
    link: string;
}

interface OpenLibraryWork {
    key: string;
    title: string;
    authors?: Array<{ name: string }>;
}

interface OpenLibraryResponse {
    works?: OpenLibraryWork[];
}

const BOOKS_LIMIT = 5;
const OPEN_LIBRARY_API = 'https://openlibrary.org/subjects';

const formatBookSuggestion = (work: OpenLibraryWork): BookSuggestion | null => {
    if (!work.title || !work.authors?.[0]?.name || !work.key) {
        return null;
    }
    return {
        title: work.title,
        author: work.authors[0].name,
        link: `https://openlibrary.org${work.key}`
    };
};

const getBookSuggestions = async (topic: string): Promise<BookSuggestion[]> => {
    const encodedTopic = encodeURIComponent(topic.toLowerCase().trim());
    const response = await fetch(`${OPEN_LIBRARY_API}/${encodedTopic}.json?limit=${BOOKS_LIMIT}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch book suggestions: ${response.statusText}`);
    }

    const data: OpenLibraryResponse = await response.json();
    if (!data.works?.length) {
        return [];
    }

    return data.works
        .map(formatBookSuggestion)
        .filter((book): book is BookSuggestion => book !== null)
        .slice(0, BOOKS_LIMIT);
};