# NanoClaw Personal EA — Phase 1: Core + WhatsApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a personal AI Executive Assistant running on NanoClaw, accessible via WhatsApp, with a custom EA personality configured via CLAUDE.md.

**Architecture:** Fork NanoClaw (qwibitai/nanoclaw), run `/setup` via Claude Code to handle container + dependency bootstrapping, configure a custom CLAUDE.md for EA personality, then connect WhatsApp via the `/add-whatsapp` skill. Each agent session runs inside an isolated Docker/Apple Container for security.

**Tech Stack:** NanoClaw (TypeScript), Claude Code CLI, Anthropic Claude API, Docker or Apple Container, WhatsApp (Baileys multi-device library), Node.js 20+

---

## File Map

| File | Purpose |
|---|---|
| `~/nanoclaw/CLAUDE.md` | EA personality, instructions, memory patterns |
| `~/nanoclaw/.env` | ANTHROPIC_API_KEY and other secrets |
| `~/nanoclaw/store/auth/` | WhatsApp session credentials (auto-generated) |

---

### Task 1: Verify Prerequisites

**Files:**
- No files created — environment check only

- [ ] **Step 1: Check Node.js version (must be 20+)**

```bash
node --version
```

Expected output: `v20.x.x` or higher. If not installed or older:
```bash
# macOS with Homebrew
brew install node@20
brew link node@20
```

- [ ] **Step 2: Check Claude Code is installed**

```bash
claude --version
```

Expected output: a version string like `1.x.x`. If missing:
```bash
npm install -g @anthropic-ai/claude-code
```

- [ ] **Step 3: Check container runtime**

```bash
# Check Docker
docker --version

# OR check Apple Container (macOS Sequoia+)
container --version
```

Expected: either returns a version. If Docker missing:
```bash
brew install --cask docker
open /Applications/Docker.app   # Start Docker Desktop
```

- [ ] **Step 4: Verify Anthropic API key exists**

```bash
echo $ANTHROPIC_API_KEY
```

Expected: a non-empty string starting with `sk-ant-`. If missing, get one at https://console.anthropic.com and add to your shell:
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-YOUR_KEY_HERE"' >> ~/.zshrc
source ~/.zshrc
```

- [ ] **Step 5: Check GitHub CLI (for forking)**

```bash
gh --version
```

Expected: `gh version 2.x.x`. If missing:
```bash
brew install gh
gh auth login
```

- [ ] **Step 6: Commit checkpoint**

Nothing to commit — prerequisite check complete. Note any versions for reference.

---

### Task 2: Fork and Clone NanoClaw

**Files:**
- Creates: `~/nanoclaw/` (entire repo)

- [ ] **Step 1: Fork the NanoClaw repo to your GitHub account**

```bash
gh repo fork qwibitai/nanoclaw --clone --remote
```

Expected output:
```
✓ Created fork omerzulfiqar/nanoclaw
Cloning into 'nanoclaw'...
✓ Cloned fork
```

- [ ] **Step 2: Navigate into the directory**

```bash
cd ~/nanoclaw
ls
```

Expected: you see files including `package.json`, `CLAUDE.md`, `src/`, etc.

- [ ] **Step 3: Verify the upstream remote is set**

```bash
git remote -v
```

Expected output includes both:
```
origin    https://github.com/omerzulfiqar/nanoclaw.git (fetch)
upstream  https://github.com/qwibitai/nanoclaw.git (fetch)
```

---

### Task 3: Run NanoClaw Setup

**Files:**
- Modifies: `~/nanoclaw/.env` (created by setup)
- Modifies: `~/nanoclaw/package.json` (dependencies installed)

- [ ] **Step 1: Launch Claude Code inside the nanoclaw directory**

```bash
cd ~/nanoclaw
claude
```

Expected: Claude Code starts and you see the `>` prompt.

- [ ] **Step 2: Run the setup skill**

Inside the Claude Code prompt, type:
```
/setup
```

Expected: Claude Code will walk through the following automatically:
- Install Node dependencies (`npm install`)
- Verify your `ANTHROPIC_API_KEY`
- Detect your container runtime (Docker or Apple Container)
- Configure container settings
- Create `.env` if it doesn't exist

This may take 2–5 minutes. Watch for any errors and resolve them as prompted.

- [ ] **Step 3: Verify setup completed successfully**

After `/setup` completes, check that `.env` exists:
```bash
ls -la ~/nanoclaw/.env
```

Expected: file exists with non-zero size.

- [ ] **Step 4: Verify node_modules installed**

```bash
ls ~/nanoclaw/node_modules | head -5
```

Expected: several package directories listed.

---

### Task 4: Configure EA Personality in CLAUDE.md

**Files:**
- Modify: `~/nanoclaw/CLAUDE.md`

NanoClaw uses `CLAUDE.md` as the system prompt / memory for your agent. This is where you define who your EA is, what it can do, and how it should behave.

- [ ] **Step 1: Open and read the default CLAUDE.md**

```bash
cat ~/nanoclaw/CLAUDE.md
```

Read the existing content so you know what to preserve vs. replace.

- [ ] **Step 2: Replace CLAUDE.md with your EA personality**

Edit `~/nanoclaw/CLAUDE.md` and replace or extend it with the following (customize the sections in ALL CAPS):

```markdown
# Personal Executive Assistant

You are a personal AI Executive Assistant for YOUR_NAME. You are proactive, concise, and organised.

## Identity
- Your name is YOUR_EA_NAME (e.g. "Max" or "Aria")
- You speak in a professional but warm tone
- You default to bullet points and short sentences
- You always confirm before taking any irreversible action

## Core Responsibilities
- Calendar and scheduling reminders
- Task tracking and follow-ups
- Research and summarisation
- Drafting messages and emails
- General question answering

## Preferences
- Time zone: YOUR_TIMEZONE (e.g. America/New_York)
- Date format: YOUR_DATE_FORMAT (e.g. DD/MM/YYYY)
- Response length: concise unless asked to elaborate
- Language: English

## Memory
- Remember context within a conversation session
- If asked to "remember X", store it in this file under a ## Notes section

## Boundaries
- Do not send messages or take external actions without explicit instruction
- Do not store sensitive information (passwords, financial data) in memory
- If unsure about an instruction, ask for clarification before acting
```

- [ ] **Step 3: Commit the CLAUDE.md changes**

```bash
cd ~/nanoclaw
git add CLAUDE.md
git commit -m "feat: configure personal EA personality in CLAUDE.md"
```

---

### Task 5: Connect WhatsApp

**Files:**
- Creates: `~/nanoclaw/store/auth/` (auto-generated session credentials)

- [ ] **Step 1: Inside Claude Code, run the add-whatsapp skill**

Make sure you're still in the Claude Code prompt (`claude` running in `~/nanoclaw`). Type:

```
/add-whatsapp
```

- [ ] **Step 2: Choose authentication method**

You'll be prompted to choose one of:

| Option | When to use |
|---|---|
| **QR Code (Browser)** | On your Mac desktop — easiest |
| **QR Code (Terminal)** | Headless server |
| **Pairing Code** | If QR doesn't work |

Recommended: **QR Code (Browser)**

- [ ] **Step 3: Scan QR code with your phone**

On your iPhone:
1. Open **WhatsApp**
2. Tap **Settings** → **Linked Devices** → **Link a Device**
3. Point camera at the QR code on screen

Expected: browser/terminal shows "✓ Connected" or similar success message.

- [ ] **Step 4: Register a chat for the EA to monitor**

When prompted, choose **Self-chat** (message yourself) for initial testing. You can add more chats later.

- [ ] **Step 5: Verify session credentials were saved**

```bash
ls ~/nanoclaw/store/auth/
```

Expected: one or more credential files. This means NanoClaw will auto-reconnect without re-scanning.

---

### Task 6: End-to-End Test

**Files:**
- No files modified — validation only

- [ ] **Step 1: Send a test message to yourself on WhatsApp**

Open WhatsApp on your phone, go to your own chat (the number you linked), and send:

```
Hello, who are you?
```

Expected: your EA responds with something like:
```
Hi! I'm YOUR_EA_NAME, your personal Executive Assistant. How can I help you today?
```

- [ ] **Step 2: Test a simple task**

Send:
```
What's the capital of Japan?
```

Expected: a concise factual response.

- [ ] **Step 3: Test EA personality adherence**

Send:
```
Remind me to follow up with John tomorrow about the project proposal.
```

Expected: EA acknowledges and either sets a reminder (if scheduled jobs are configured) or confirms it will remind you next session.

- [ ] **Step 4: Test reconnection**

Stop and restart NanoClaw:
```bash
# In a new terminal tab
cd ~/nanoclaw
npm start   # or however NanoClaw starts — check package.json scripts
```

Send another WhatsApp message. Expected: EA responds without needing to re-scan the QR code.

- [ ] **Step 5: Commit final state**

```bash
cd ~/nanoclaw
git add -A
git commit -m "feat: NanoClaw Phase 1 complete — EA + WhatsApp working"
```

---

## What's Next

- **Phase 2:** iMessage via BlueBubbles — plan: `2026-04-12-nanoclaw-ea-imessage.md`
- **Phase 3:** Voice layer via Whisper + ElevenLabs — plan: `2026-04-12-nanoclaw-ea-voice.md`

---

## Troubleshooting Reference

| Problem | Fix |
|---|---|
| QR code expires before scanning | Run `/add-whatsapp` again to regenerate |
| Container fails to start | Run `docker ps` to check Docker is running |
| `ANTHROPIC_API_KEY` not found | Re-export in shell and restart `claude` |
| WhatsApp disconnects | Check `store/auth/` exists; if empty re-run `/add-whatsapp` |
| EA gives wrong persona | Re-check `CLAUDE.md` edits were saved and restart NanoClaw |
