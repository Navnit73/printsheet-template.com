import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
	...defineCloudflareConfig({
		// Configure incrementalCache here once an R2 bucket and r2_buckets binding
		// are provisioned in wrangler.jsonc. See https://opennext.js.org/cloudflare/caching
	}),
	// Run `next build` once inside `opennextjs-cloudflare build` (`npm run build`)
	buildCommand: "npm run build:next",
};

export default config;

