import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const config: OpenNextConfig = {
	...defineCloudflareConfig({
		incrementalCache: staticAssetsIncrementalCache,
	}),
	// Run `next build` once inside `opennextjs-cloudflare build` (`npm run build`)
	buildCommand: "npm run build:next",
};

export default config;
