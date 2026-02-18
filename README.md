# TalkLLM

A ChatGPT-style chat interface that runs entirely in your browser. Bring your own OpenAI API key and chat with any model your account has access to — no backend, no data collection, no subscriptions.

## Features

- **All OpenAI models** — fetches every chat-capable model on your account (GPT-4o, o1, o3, GPT-3.5, etc.) and lets you switch between them mid-session
- **Streaming responses** — tokens appear as they're generated; stop at any time with the Stop button
- **Folders** — organize conversations into collapsible folders; a locked "Default" folder always exists for new chats
- **Conversation history** — full chat history persisted in `localStorage`, survives page refreshes
- **Markdown rendering** — assistant responses render with GFM: headers, tables, code blocks with syntax highlighting and copy buttons
- **Usage panel** — shows your remaining OpenAI credit balance and the input/output token pricing for the selected model
- **API key stored locally** — your key lives only in your browser's `localStorage` and is sent only to OpenAI

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Install & run

```bash
git clone <repo-url>
cd talkllm
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), paste your OpenAI API key, and start chatting.

### Build for production

```bash
npm run build        # outputs to dist/
npm run preview      # serve the built output locally
```

## Usage

### API Key

On first load you'll be prompted for your OpenAI API key. The key is validated against the OpenAI API before being saved. It's stored in `localStorage` under the key `talkllm:apiKey` and is never sent anywhere other than `api.openai.com`.

To change or remove your key, click **Change API Key** at the bottom of the sidebar.

### Conversations

- **New Chat** — starts a new conversation in the Default folder
- **Rename** — the conversation title is set automatically from your first message
- **Delete** — hover over a conversation in the sidebar and click the trash icon

### Folders

- Conversations are grouped into collapsible folders in the sidebar
- The **Default** folder is permanent and cannot be renamed or deleted
- Click **+ New Folder** at the bottom of the folder list to create one
- Hover a non-Default folder to access **Rename** and **Delete** (deleting a folder moves its conversations to Default)
- Hover any conversation to reveal a **move icon** — click it to move the conversation to a different folder
- Folder collapsed/expanded state persists across page refreshes

### Model Selection

The model dropdown (bottom of the sidebar) lists all chat-capable models on your account. Your selection persists across sessions. If a previously selected model is no longer available, the app falls back to `gpt-4o`.

### Stopping a response

Click the **Stop** button (square icon in the input bar) at any time to cancel a streaming response. Any content already received is preserved.

### Usage Panel

The sidebar shows:
- **Credit balance** — remaining OpenAI credits (may show "Not available" for pay-as-you-go accounts without credit grants)
- **Model pricing** — input, output, and cached-input prices per 1M tokens for the currently selected model

Click the refresh icon next to the balance to fetch the latest figure.

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v3 + `@tailwindcss/typography` |
| AI | `openai` npm package (v4, streaming via async iterable) |
| Markdown | `react-markdown` + `remark-gfm` + `react-syntax-highlighter` |
| Icons | `lucide-react` |
| Storage | Browser `localStorage` |

## Project Structure

```
src/
├── types/index.ts          # Shared TypeScript interfaces (Message, Conversation, Folder, …)
├── utils/
│   ├── storage.ts          # localStorage read/write helpers
│   ├── openai.ts           # OpenAI client factory, validation, error parsing
│   ├── models.ts           # Model filtering, display names, sort order
│   ├── pricing.ts          # Hardcoded token pricing table + formatter
│   └── billing.ts          # Credit balance fetcher
├── hooks/
│   ├── useApiKey.ts        # Key load/save/clear + validation
│   ├── useConversations.ts # Conversation CRUD + localStorage sync
│   ├── useFolders.ts       # Folder CRUD + collapse toggle
│   ├── useModels.ts        # Model list fetcher + selection
│   ├── useChat.ts          # Streaming send/stop, abort controller
│   └── useUsageMetrics.ts  # Balance + pricing for selected model
└── components/
    ├── ApiKeyScreen/       # Full-screen key entry gate
    ├── Chat/               # MessageList, MessageBubble, ChatInput, TypingIndicator
    ├── Markdown/           # ReactMarkdown wrapper with syntax highlighting
    ├── ModelSelector/      # Dropdown for switching models
    ├── UsagePanel/         # Credit balance + pricing widget
    ├── Layout/             # Shell, Sidebar (folders + conversations)
    └── ui/                 # Button, Spinner primitives
```

## Privacy

- Your API key and all conversation data stays in your browser's `localStorage`
- No analytics, no telemetry, no server of any kind
- The only external requests made are to `api.openai.com`
