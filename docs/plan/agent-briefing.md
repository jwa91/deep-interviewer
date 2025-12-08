You are a senior typescript developer, its your task to plan the build of a "deep agent", using LangChains new Deep Agents library.

The deep agent conducts conversational interviews with course participants to gather feedback. Instead of sending out boring survey forms that nobody wants to fill in, participants receive an invite to have a short conversation with an AI interviewer about their experience.The key insight: surveys fail not because questions are bad, but because there's no follow-up, no adaptation, and no sense of being heard. A conversational agent fixes all of this while still ensuring all required feedback topics get covered.

**## Core Concept**

Input: A participant clicks a link and starts chatting

Process: The agent has a friendly conversation, naturally weaving in the feedback questions, going deeper when something interesting comes up

Output: Structured feedback data (like a form would give) PLUS rich conversational insights

## Requirements:

The agent should feel like a curious, friendly peer — not an interrogator or a bot reading questions off a list.

The specific questions that are asked for by the agent should be managebale with relative ease (not in the ui, but not scatteered all over the entire code).
Model should be configurable, this project already contains a .env file with the following keys:

GROQ*API_KEY=gsk*\*\*

OPENAI_API_KEY=sk-proj-\*\*

ANTHROPIC_API_KEY=sk-ant-\*\*

LANGSMITH*API_KEY=lsv2_pt*\*\*

LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com

LANGSMITH_TRACING=true

Your plan is scoped to the "backend" of this project, including a strategy for persistance, statemanagement, datamodel etcetera. On top of this core logic front end will be build.

The entire project will live in a docker container, and the chat UI will be exposed via caddy as a reverse proxy.

In total about 30 participants will get an invite to fill in the survey, so we dont need enterprise level database set ups.

We DO want streaming for the agent output and potentially tools called by the agent should also appear in the ui "JW's research agent writes the feedback in his notepad" (or something like that)

Some of the deep agents concepts mapped on this specific usecase:

Planning/Todos - Pre-seeded with the core feedback questions. Agent checks them off as topics are covered (even if discussed out of order).
Tools - i am planning to give the agent a couple of different tools that help in situations where participants say something like "this is something i would like to learn more about" - they would have a tool like: "ask JW (the instructor of the course) to come back to that later.
Memory/state. - keeping track of what questions are aswered and what questions are not, potentially also keeping track of follow ups.

this is from another project but sort of (doesnt have to be exact) how i wanna run the application on my vps..

```
# Dockerfile for VPS Documentation

# ---- Build Stage ----
FROM node:24-alpine AS build

RUN npm install -g pnpm
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate sidebar and build the documentation
# Temporarily disable broken link checking in Docker build for MVP
RUN pnpm generate-sidebar && \
    sed -i 's/onBrokenLinks: .throw./onBrokenLinks: "warn",/' docusaurus.config.ts && \
    pnpm build

# ---- Serve Stage ----
FROM nginx:1.27-alpine

# Copy built documentation
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Can you propose highlevel how you would plan this in tasks? if i a gree i put you in planmode so you can actually plan the work.
