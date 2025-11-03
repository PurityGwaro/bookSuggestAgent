# 📚 Book Suggestion Agent

An intelligent assistant powered by Mastra AI that helps you discover great books on any topic through natural conversation.

Book Suggestion Agent is an AI-powered assistant that provides personalized book recommendations based on your interests. Built with the Mastra.ai framework and leveraging Google's Gemini 2.5 Flash model, it helps you find your next great read through natural language queries.

## ✨ Features

- 🤖 **AI-Powered**: Powered by Google Gemini 2.5 Flash for intelligent conversation and understanding.
- 📚 **Wide Range of Topics**: Get book suggestions for any topic, genre, or interest area.
- 💬 **Natural Conversation**: Chat naturally with the agent to get personalized recommendations.
- 🧠 **Memory System**: Maintains conversation context using LibSQL for persistent storage.
- 🌐 **Agent-to-Agent Protocol**: Supports A2A (Agent-to-Agent) communication via JSON-RPC 2.0.
- 📊 **Observability**: Built-in AI tracing and monitoring with Mastra's observability tools.

## 🏗️ Architecture

The project is structured around the Mastra framework:

```
src/mastra/
├── index.ts              # Main Mastra configuration
├── agents/
│   └── book-suggest-agent.ts  # The book suggestion agent
├── tools/
│   └── book-suggest-tool.ts   # Tool for fetching book data from Open Library
├── workflows/
│   └── book-suggest-workflow.ts # Workflow for book suggestion process
└── routes/
    └── a2a-agent-route.ts     # Agent-to-Agent API endpoint
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20.9.0 or higher.
- **npm**: package manager I used.
- **Open Library API**: `GOOGLE_GENERATIVE_AI_API_KEY` API key required as it uses Gemini AI - You get this through creating an account with Google AI Studio.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/book-suggest-agent
   cd book-suggest-agent
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Running the Application

1. **Development Mode**

   Start the development server with hot-reload:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:4111`.

2. **Production Build**

   Build the application for production:

   ```bash
   npm run build
   ```

   Run the production server:

   ```bash
   npm start
   ```

## 📖 Usage

### Interactive Chat (Mastra Playground)

When you run `npm run dev`, Mastra automatically opens a playground interface in your browser where you can:

1. Select the `bookSuggestAgent` from the agents dropdown.
2. Start a conversation.
3. Ask for book recommendations on any topic.

**Example Conversations:**

> **You:** Can you recommend some books about artificial intelligence?

> **Agent:** [Responds with 5 book recommendations about AI]

> **You:** I'm interested in Japanese literature

> **Agent:** [Suggests Japanese literature books]

### Agent-to-Agent API

The Book Suggestion Agent supports the A2A protocol for programmatic interaction.

**Endpoint**: `POST /a2a/agent/bookSuggestAgent` 

**Request Format (JSON-RPC 2.0):**

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "generate",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Recommend books about machine learning"
        }
      ]
    }
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:4111/a2a/agent/bookSuggestAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "book-request-1",
    "method": "generate",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "Suggest books about space exploration"}]
      }
    }
  }'
```

## 🧠 The Agent

The Book Suggestion Agent is designed to be friendly and helpful with the following capabilities:

- Accepts any topic, genre, or interest area
- Handles vague or broad topics by providing focused suggestions
- Works with non-English topics (automatically translates when needed)
- Provides up to 5 relevant book suggestions per query
- Includes author names and purchase links for each recommendation
- Maintains conversation context for follow-up questions

## 🛠️ Technology Stack

- **Mastra.ai**: The AI agent framework
- **Google Gemini 2.5 Flash**: LLM for natural language understanding
- **Open Library API**: For fetching book data and recommendations
- **LibSQL**: Embedded SQL database for memory/storage
- **TypeScript**: For type-safe development
- **Zod**: TypeScript-first schema validation

## 📝 License

This project is licensed under the ISC License.

---

Made using Mastra.ai
