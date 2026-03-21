import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../api/gamma.js";
import type { ClobApi } from "../api/clob.js";

export function registerResources(
  server: McpServer,
  gamma: GammaApi,
  clob: ClobApi,
) {
  server.resource(
    "market-by-slug",
    new ResourceTemplate("market://slug/{slug}", { list: undefined }),
    async (uri, params) => {
      const slug = params.slug as string;
      const market = await gamma.getMarket({ slug });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(market, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "event-by-slug",
    new ResourceTemplate("event://slug/{slug}", { list: undefined }),
    async (uri, params) => {
      const slug = params.slug as string;
      const event = await gamma.getEvent({ slug });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(event, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "clob-market",
    new ResourceTemplate("market://condition/{condition_id}", {
      list: undefined,
    }),
    async (uri, params) => {
      const conditionId = params.condition_id as string;
      const market = await clob.getMarket(conditionId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(market, null, 2),
          },
        ],
      };
    },
  );

  server.resource(
    "orderbook",
    new ResourceTemplate("orderbook://token/{token_id}", {
      list: undefined,
    }),
    async (uri, params) => {
      const tokenId = params.token_id as string;
      const book = await clob.getOrderBook(tokenId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(book, null, 2),
          },
        ],
      };
    },
  );

  server.resource("tags", "tags://all", async (uri) => {
    const tags = await gamma.getTags();
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(tags, null, 2),
        },
      ],
    };
  });
}
