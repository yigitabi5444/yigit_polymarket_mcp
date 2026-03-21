import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

describe("Polymarket MCP Server Integration", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  async function createConnectedPair() {
    const server = createServer();
    const client = new Client({ name: "test-client", version: "1.0.0" });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    return { server, client };
  }

  it("lists all tools", async () => {
    const { client } = await createConnectedPair();
    const { tools } = await client.listTools();

    const toolNames = tools.map((t) => t.name);

    // Gamma tools
    expect(toolNames).toContain("get_events");
    expect(toolNames).toContain("get_event");
    expect(toolNames).toContain("get_markets");
    expect(toolNames).toContain("get_market");
    expect(toolNames).toContain("search");
    expect(toolNames).toContain("get_tags");
    expect(toolNames).toContain("get_series");
    expect(toolNames).toContain("get_series_by_id");
    expect(toolNames).toContain("get_sports");
    expect(toolNames).toContain("get_sports_teams");

    // CLOB tools
    expect(toolNames).toContain("get_price");
    expect(toolNames).toContain("get_midpoint");
    expect(toolNames).toContain("get_last_trade_price");
    expect(toolNames).toContain("get_order_book");
    expect(toolNames).toContain("get_order_books");
    expect(toolNames).toContain("get_order_book_summary");
    expect(toolNames).toContain("get_clob_market");
    expect(toolNames).toContain("get_sampling_markets");
    expect(toolNames).toContain("get_sampling_simplified_markets");
    expect(toolNames).toContain("get_tick_size");

    // Data tools
    expect(toolNames).toContain("get_market_trades");
    expect(toolNames).toContain("get_market_holders");

    expect(tools.length).toBe(22);
  });

  it("lists prompts", async () => {
    const { client } = await createConnectedPair();
    const { prompts } = await client.listPrompts();

    const promptNames = prompts.map((p) => p.name);
    expect(promptNames).toContain("analyze_market");
    expect(promptNames).toContain("compare_markets");
    expect(promptNames).toContain("trending_markets");
    expect(promptNames).toContain("sports_overview");
    expect(prompts.length).toBe(4);
  });

  it("calls search tool with mocked API", async () => {
    const mockResults = {
      events: [{ id: "1", title: "Test Election", slug: "test-election" }],
      markets: [{ id: "m1", question: "Who wins?", slug: "who-wins" }],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResults),
    });

    const { client } = await createConnectedPair();
    const result = await client.callTool({
      name: "search",
      arguments: { query: "election" },
    });

    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);

    const textContent = result.content as Array<{ type: string; text: string }>;
    expect(textContent[0].type).toBe("text");

    const parsed = JSON.parse(textContent[0].text);
    expect(parsed.events).toHaveLength(1);
    expect(parsed.markets).toHaveLength(1);
  });

  it("returns error for get_event without id or slug", async () => {
    const { client } = await createConnectedPair();
    const result = await client.callTool({
      name: "get_event",
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const textContent = result.content as Array<{ type: string; text: string }>;
    expect(textContent[0].text).toContain("Either id or slug is required");
  });

  it("calls get_markets with filters", async () => {
    const mockMarkets = [
      { id: "1", question: "High volume market", volume: "1000000" },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockMarkets),
    });

    const { client } = await createConnectedPair();
    const result = await client.callTool({
      name: "get_markets",
      arguments: {
        limit: 5,
        order: "volume",
        ascending: false,
        active: true,
      },
    });

    const textContent = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(textContent[0].text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].question).toBe("High volume market");
  });
});
