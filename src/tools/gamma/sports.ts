import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import { jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_sports",
    "List available sports on Polymarket (e.g. NBA, NFL, EPL, MLB).",
    {},
    async () => {
      try {
        const data = await gamma.getSports();
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    "get_sports_teams",
    "List teams for a given sport on Polymarket.",
    {
      sport: z.string().optional().describe("Sport code (e.g. 'nba', 'nfl', 'epl')"),
    },
    async (args) => {
      try {
        const data = await gamma.getSportsTeams(args.sport);
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
