# Agent Swarm

## 📦 Overview

This project demonstrates an agent swarm architecture built to process messages, retrieve contextual knowledge, and generate intelligent responses.  
The system combines multiple specialized agents, a Retrieval-Augmented Generation (RAG) pipeline, and LLM tools to handle complex workflows efficiently.

---

## ⚙️ Setup & Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lnrdrodri/agent-swarm
   cd agent-swarm
   ```

2. **Configure environment variables**

   - Create a `.env` file at the root directory.
   - Add the required variables (example):
     ```env
     OPENAI_API_KEY=
     SERPER_API_KEY=
     PORT=
     SUPABASE_URL=
     SUPABASE_KEY=
     ```

3. **Build the Docker image**

   ```bash
   docker build -t agent-swarm-app .
   ```

4. **Run the container**

   ```bash
   docker-compose up --build
   ```

5. **Optional: Run in detached mode**
   ```bash
   docker-compose up -d --build
   ```

---

## 🤖 Agent Swarm Architecture

### Design Choices

- The system is composed of multiple agents, each responsible for a specific task (router, web search, RAG retriever, customer support and personality).
- A **Router Agent (Orchestrator)** routes messages between agents, ensuring correct answers, modularity and scalability.
- This design allows easy extension: new agents can be added without changing the whole system.

### Message Workflow

1. **Input** – The user sends a message to the system.
2. **Router Agent** – Interprets the request and determines which agents should be activated.
3. **Retriever Agent** – Fetches relevant knowledge from the internal knowledge base (focused on InfinitePay in this case).
4. **Customer Support Agent** – Looks up user-specific information from the database (currently a JSON file, but could be extended to a Postgres database).
5. **Web Search Agent** – Uses Serper to retrieve up-to-date information from the internet.
6. **Personality Agent** – Collects and analyzes all agent responses, applies a consistent persona, and produces the final user-friendly answer.

---

## 🛠️ LLM Tools

- The system integrates **Large Language Models (gpt-4o-mini)** to interpret user input, create a workflow, and generate final responses.
- LLMs are used as:
  - **Planners** to break down tasks.
  - **Generators** to provide natural language outputs.
  - **Assistants** for validating or improving retrieved knowledge.

---

## 📚 RAG Pipeline

### Ingestion

- Data ingestion is automated through a cron job that runs every Sunday at 2 AM. It executes the script src/utils/embedPages.js, which crawls web sources and prepares the content for embedding.
- Content is preprocessed (HTML parsing, cleaning, vetorization).
- Embeddings are generated using an LLM embedding model.

### Storage

- Vectors are stored in a **vector database** (Supabase).
- Metadata (title, source, timestamps) is also stored for filtering.

### Retrieval

- At query time, the retriever searches the vector database using semantic similarity.
- Relevant chunks are ranked and passed to the generator.

### Generation

- Retrieved context is injected into the LLM prompt.
- The LLM then produces a response grounded in the retrieved data, reducing hallucination.

