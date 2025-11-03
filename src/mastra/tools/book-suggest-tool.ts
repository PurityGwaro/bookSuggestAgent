import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface BookSuggestion {
    author: string;
    title: string;
    link: string;
}

interface OpenLibraryWork {
    key: string;
    title: string;
    authors?: Array<{ name: string }>;
    first_publish_year?: number;
    subject?: string[];
}

interface OpenLibraryResponse {
    works?: OpenLibraryWork[];
    name?: string;
}

const BOOKS_LIMIT = 5;
const OPEN_LIBRARY_API = 'https://openlibrary.org/subjects';
const REQUEST_TIMEOUT = 10000; // 10 seconds

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
    try {
        // Clean and encode the topic - keep it flexible for any user input
        const cleanedTopic = topic
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/gi, ' ') // Replace special chars with space
            .replace(/\s+/g, '_') // Replace spaces with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        
        if (!cleanedTopic) {
            throw new Error(`Please provide a topic to search for books.`);
        }

        const encodedTopic = encodeURIComponent(cleanedTopic);
        
        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        const response = await fetch(
            `${OPEN_LIBRARY_API}/${encodedTopic}.json?limit=10`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal
            }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`I couldn't find books specifically about "${topic}". Try rephrasing your topic or try something more general or specific.`);
            }
            if (response.status === 429) {
                throw new Error(`The book service is busy right now. Please try again in a moment.`);
            }
            throw new Error(`Sorry, I'm having trouble fetching books right now. Please try again.`);
        }

        const data: OpenLibraryResponse = await response.json();
        
        if (!data.works || data.works.length === 0) {
            throw new Error(`I couldn't find books about "${topic}". Try rephrasing or being more specific about what you're looking for.`);
        }

        const suggestions = data.works
            .map(formatBookSuggestion)
            .filter((book): book is BookSuggestion => book !== null)
            .slice(0, BOOKS_LIMIT);

        if (suggestions.length === 0) {
            throw new Error(`I found some results but couldn't get complete book information for "${topic}". Try a different search term.`);
        }

        return suggestions;
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error(`The search is taking too long. Please try again or try a different topic.`);
            }
            throw error;
        }
        throw new Error(`Unexpected error while searching for books. Please try again.`);
    }
};

export const bookSuggestTool = createTool({
    id: 'get-book-suggestions',
    description: 'Get up to 5 book suggestions for any given topic from Open Library',
    inputSchema: z.object({
        topic: z.string().describe('The topic or genre to get book recommendations for'),
    }),
    outputSchema: z.object({
        suggestions: z.array(z.object({
            author: z.string(),
            title: z.string(),
            link: z.string(),
        })),
        topic: z.string(),
    }),
    execute: async ({ context }) => {
        const suggestions = await getBookSuggestions(context.topic);
        return { 
            suggestions,
            topic: context.topic
        };
    },
});