<p align="center">
  <img src="https://polymarket.com/icons/favicon-196x196.png" width="80" height="80" alt="Polymarket logo" />
</p>

<h1 align="center">polymarket-mcp</h1>

<p align="center">
  <strong>A production-grade MCP server for <a href="https://polymarket.com">Polymarket</a> prediction markets.</strong><br/>
  Give Claude (or any MCP client) full read access to every public Polymarket API.
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/Get_Started-blue?style=for-the-badge" alt="Get Started" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@yigit/polymarket-mcp"><img src="https://img.shields.io/npm/v/@yigit/polymarket-mcp?style=for-the-badge&logo=npm&color=cb3837" alt="npm" /></a>&nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" /></a>&nbsp;
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-8A2BE2?style=for-the-badge" alt="MCP Compatible" /></a>
</p>

---

## Why?

Prediction markets are the best real-time signal for what the world thinks will happen next. This server puts that signal directly into your AI assistant's toolkit — no API keys, no auth tokens, no setup hassle.

**23 tools** &bull; **5 resources** &bull; **4 prompts** &bull; **Zero config** &bull; **Zero dependencies beyond the MCP SDK**

---

## Quick Start

### Option 1: Claude Desktop

Add to your `claude_desktop_config.json` (`Settings > Developer > Edit Config`):

```json
{
  "mcpServers": {
    "polymarket": {
      "command": "npx",
      "args": ["-y", "@yigit/polymarket-mcp"]
    }
  }
}
```

Restart Claude Desktop. Done.

### Option 2: Claude Code

```bash
claude mcp add polymarket -- npx -y @yigit/polymarket-mcp
```

### Option 3: Build from source

```bash
git clone https://github.com/yigitabi5444/yigit_polymarket_mcp.git
cd yigit_polymarket_mcp
npm install && npm run build
node dist/index.js  # runs over stdio
```

Then point your MCP client at the built binary:

```json
{
  "mcpServers": {
    "polymarket": {
      "command": "node",
      "args": ["/absolute/path/to/yigit_polymarket_mcp/dist/index.js"]
    }
  }
}
```

---

## What Can It Do?

### Gamma API — Events & Markets

| Tool | What it does |
|------|-------------|
| `get_events` | List/filter events — paginate, sort by volume/liquidity, filter by tag/status |
| `get_event` | Single event by ID or slug |
| `get_markets` | List/filter markets with rich filtering (volume, liquidity, dates, tags) |
| `get_market` | Single market by ID or slug |
| `search` | Full-text search across events, markets, and profiles |
| `get_tags` | List all category tags |
| `get_series` | List event series (grouped collections) |
| `get_series_by_id` | Get a specific series by ID |
| `get_sports` | List available sports |
| `get_sports_teams` | List teams for a sport |

### CLOB API — Prices & Order Books

| Tool | What it does |
|------|-------------|
| `get_price` | Current price for a token (buy/sell side) |
| `get_midpoint` | Midpoint price (best bid + best ask / 2) |
| `get_last_trade_price` | Last executed trade price |
| `get_price_history` | Historical price time series (configurable interval + fidelity) |
| `get_order_book` | Full bid/ask depth for a token |
| `get_order_books` | Batch order books for multiple tokens |
| `get_order_book_summary` | Best bid, best ask, and spread at a glance |
| `get_clob_market` | CLOB market details by condition ID |
| `get_sampling_markets` | Markets eligible for liquidity rewards |
| `get_sampling_simplified_markets` | Simplified sampled markets |
| `get_tick_size` | Minimum price increment for a token |

### Data API — Trades & Holders

| Tool | What it does |
|------|-------------|
| `get_market_trades` | Recent trades for a market |
| `get_market_holders` | Top holders / position breakdown for a market |

### Resources (URI-based access)

| URI Pattern | Description |
|-------------|-------------|
| `market://slug/{slug}` | Market JSON by slug |
| `event://slug/{slug}` | Event JSON by slug |
| `market://condition/{id}` | CLOB market by condition ID |
| `orderbook://token/{id}` | Live order book for a token |
| `tags://all` | All category tags (cached) |

### Prompts (guided workflows)

| Prompt | Description |
|--------|-------------|
| `analyze_market` | Deep-dive: probability, liquidity, order book depth, top holders |
| `compare_markets` | Side-by-side comparison of multiple markets |
| `trending_markets` | Find the hottest markets by volume right now |
| `sports_overview` | Overview of sports prediction markets |

---

## Architecture

```
┌─────────────────────────────┐
│        MCP Client           │
│  (Claude Desktop / Code)    │
└─────────┬───────────────────┘
          │ stdio (JSON-RPC)
┌─────────▼───────────────────┐
│      polymarket-mcp         │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │  Tools   │ │Resources │  │
│  │ (22)     │ │  (5)     │  │
│  └────┬─────┘ └────┬─────┘  │
│       │             │        │
│  ┌────▼─────────────▼─────┐  │
│  │     API Client         │  │
│  │  ┌───────┐ ┌────────┐  │  │
│  │  │ Rate  │ │ Cache  │  │  │
│  │  │Limiter│ │ (TTL)  │  │  │
│  │  └───┬───┘ └───┬────┘  │  │
│  │      │         │       │  │
│  │  ┌───▼─────────▼────┐  │  │
│  │  │  Retry + Backoff │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────┬───────────────────┘
           │ HTTPS
┌──────────▼───────────────────┐
│     Polymarket APIs          │
│  gamma-api · clob · data-api │
└──────────────────────────────┘
```

### Smart Defaults

List endpoints (`get_markets`, `get_events`) default to **active=true, closed=false, order=volume descending** — you get the hottest live markets out of the box, not ancient resolved ones from 2020. Override any default explicitly when you need historical data.

### Clean Responses

Raw Polymarket API responses contain 50+ fields per market (including gems like `pagerDutyNotificationEnabled` and `mailchimpTag`). This server strips the noise and returns a curated subset. JSON-encoded strings like `outcomes` and `outcomePrices` are parsed into real arrays — `["Yes", "No"]` not `"[\"Yes\", \"No\"]"`.

### Production Hardening

| Feature | Implementation |
|---------|---------------|
| **Rate limiting** | Token-bucket per API endpoint (Gamma: 4k/10s, CLOB: 9k/10s, Data: 1k/10s) |
| **Caching** | In-memory TTL cache (order books: 5s, markets: 30s, tags: 5min) |
| **Retries** | Exponential backoff with jitter on 429s and 5xx errors (3 retries max) |
| **Timeouts** | 15s request timeout on all API calls |
| **No auth** | Only hits public endpoints — zero secrets to manage |
| **No deps** | Uses native `fetch` — no axios, no node-fetch, just the MCP SDK + Zod |
| **Type safety** | Full TypeScript with strict mode, Zod validation on all inputs |

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `POLYMARKET_CACHE_DISABLED` | `false` | Set to `true` to disable all caching |

That's it. No API keys, no tokens, no config files. It just works.

---

## Development

```bash
npm install          # install dependencies
npm run build        # compile TypeScript
npm run dev          # run with tsx (auto-reload)
npm test             # run test suite
npm run test:watch   # tests in watch mode
```

### Project Structure

```
src/
├── index.ts              # stdio entrypoint
├── server.ts             # MCP server factory
├── config.ts             # rate limits, cache TTLs, timeouts
├── api/
│   ├── client.ts         # HTTP client with retry + rate limiting
│   ├── cache.ts          # TTL cache implementation
│   ├── rate-limiter.ts   # token-bucket rate limiter
│   ├── gamma.ts          # Gamma API wrapper
│   ├── clob.ts           # CLOB API wrapper
│   └── data.ts           # Data API wrapper
├── tools/
│   ├── gamma/            # 6 Gamma tools
│   ├── clob/             # 4 CLOB tools
│   └── data/             # 2 Data tools
├── resources/            # 5 URI-based resources
├── prompts/              # 4 guided analysis prompts
└── types/                # TypeScript type definitions
```

---

## Example Conversations

> **You:** What are the hottest prediction markets right now?
>
> **Claude:** *uses `get_markets` sorted by volume, then `get_order_book` for depth analysis*

> **You:** What's the current probability that Bitcoin hits $200k this year?
>
> **Claude:** *uses `search("bitcoin 200k")`, then `get_price` for live odds*

> **You:** Compare the presidential election markets
>
> **Claude:** *uses the `compare_markets` prompt with relevant slugs*

> **You:** Show me the order book for the top sports market
>
> **Claude:** *uses `get_sports` → `get_markets` → `get_order_book`*

---

## Contributing

PRs welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Add tests for new functionality
4. Make sure `npm test` passes
5. Submit a PR

---

## License

[MIT](LICENSE) — do whatever you want with it.

---

<p align="center">
  <sub>Built with the <a href="https://modelcontextprotocol.io">Model Context Protocol</a></sub>
</p>
