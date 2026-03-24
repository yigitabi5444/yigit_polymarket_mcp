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
    expect(toolNames).toContain("get_price_history");
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

    expect(toolNames).toContain("get_market_summary");

    expect(tools.length).toBe(24);
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
      events: [
        { id: "1", title: "Test Election", slug: "test-election", ticker: "test", description: "", startDate: "", endDate: "", active: true, closed: false, archived: false, liquidity: "0", volume: "0" },
      ],
      markets: [
        { id: "m1", question: "Who wins?", slug: "who-wins", conditionId: "0x1", endDate: "", startDate: "", liquidity: "0", volume: "0", volume24hr: "0", active: true, closed: false, outcomes: "[\"Yes\",\"No\"]", outcomePrices: "[\"0.5\",\"0.5\"]", clobTokenIds: "[\"abc\",\"def\"]", bestBid: "0.49", bestAsk: "0.51", lastTradePrice: "0.5", spread: "0.02", description: "" },
      ],
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
    // Verify JSON strings are parsed into real arrays
    expect(Array.isArray(parsed.markets[0].outcomes)).toBe(true);
    expect(parsed.markets[0].outcomes).toEqual(["Yes", "No"]);
    expect(Array.isArray(parsed.markets[0].outcomePrices)).toBe(true);
    expect(parsed.markets[0].outcomePrices).toEqual([0.5, 0.5]);
    expect(Array.isArray(parsed.markets[0].clobTokenIds)).toBe(true);
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

  it("calls get_markets with default smart filters", async () => {
    const mockMarkets = [
      { id: "1", question: "High volume market", slug: "hvm", conditionId: "0x1", volume: "1000000", volume24hr: "50000", liquidity: "100000", active: true, closed: false, startDate: "", endDate: "", outcomes: "[\"Yes\",\"No\"]", outcomePrices: "[\"0.7\",\"0.3\"]", clobTokenIds: "[]", bestBid: "", bestAsk: "", lastTradePrice: "", spread: "", description: "" },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockMarkets),
    });
    globalThis.fetch = fetchMock;

    const { client } = await createConnectedPair();
    const result = await client.callTool({
      name: "get_markets",
      arguments: { limit: 5 },
    });

    // Verify default filters are applied: active=true, closed=false, order=volume
    const calledUrl = (fetchMock.mock.calls[0][0] as string);
    expect(calledUrl).toContain("active=true");
    expect(calledUrl).toContain("closed=false");
    expect(calledUrl).toContain("order=volume");

    const textContent = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(textContent[0].text);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].question).toBe("High volume market");
    // Verify slim response: no junk fields, outcomes parsed
    expect(parsed[0].outcomes).toEqual(["Yes", "No"]);
    expect(parsed[0].outcomePrices).toEqual([0.7, 0.3]);
  });

  it("search maps query to q param", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ events: [], markets: [] }),
    });
    globalThis.fetch = fetchMock;

    const { client } = await createConnectedPair();
    await client.callTool({
      name: "search",
      arguments: { query: "bitcoin" },
    });

    const calledUrl = (fetchMock.mock.calls[0][0] as string);
    expect(calledUrl).toContain("q=bitcoin");
    expect(calledUrl).not.toContain("query=bitcoin");
  });
});
