import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_sports",
    "List available sports on Polymarket (e.g. NBA, NFL, EPL, MLB).",
    {},
    async () => {
      try {
        const data = await gamma.getSports();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
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
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    },
  );
}
