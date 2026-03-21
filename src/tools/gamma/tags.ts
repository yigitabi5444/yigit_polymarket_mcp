import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import { jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_tags",
    "List all available Polymarket category tags. Use these tags to filter markets and events.",
    {},
    async () => {
      try {
        const data = await gamma.getTags();
        return jsonResponse(data.map((t) => ({ label: t.label, slug: t.slug })));
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
