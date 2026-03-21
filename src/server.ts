import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiClient } from "./api/client.js";
import { GammaApi } from "./api/gamma.js";
import { ClobApi } from "./api/clob.js";
import { DataApi } from "./api/data.js";

import { register as registerGammaEvents } from "./tools/gamma/events.js";
import { register as registerGammaMarkets } from "./tools/gamma/markets.js";
import { register as registerGammaSearch } from "./tools/gamma/search.js";
import { register as registerGammaTags } from "./tools/gamma/tags.js";
import { register as registerGammaSeries } from "./tools/gamma/series.js";
import { register as registerGammaSports } from "./tools/gamma/sports.js";
import { register as registerClobPrices } from "./tools/clob/prices.js";
import { register as registerClobOrderbook } from "./tools/clob/orderbook.js";
import { register as registerClobMarkets } from "./tools/clob/markets.js";
import { register as registerClobTickSize } from "./tools/clob/tick-size.js";
import { register as registerDataTrades } from "./tools/data/trades.js";
import { register as registerDataHolders } from "./tools/data/holders.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "polymarket-mcp",
    version: "1.0.0",
  });

  const client = new ApiClient();
  const gamma = new GammaApi(client);
  const clob = new ClobApi(client);
  const dataApi = new DataApi(client);

  // Gamma tools
  registerGammaEvents(server, gamma);
  registerGammaMarkets(server, gamma);
  registerGammaSearch(server, gamma);
  registerGammaTags(server, gamma);
  registerGammaSeries(server, gamma);
  registerGammaSports(server, gamma);

  // CLOB tools
  registerClobPrices(server, clob);
  registerClobOrderbook(server, clob);
  registerClobMarkets(server, clob);
  registerClobTickSize(server, clob);

  // Data tools
  registerDataTrades(server, dataApi);
  registerDataHolders(server, dataApi);

  // Resources & Prompts
  registerResources(server, gamma, clob);
  registerPrompts(server);

  return server;
}
