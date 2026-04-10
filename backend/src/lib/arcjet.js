import { env } from "../lib/env.js"
import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const aj = arcjet({
    key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
    rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: "LIVE" }),
        // Create a bot detection rule
        detectBot({
            mode: env.NODE_ENV === "development" ? "DRY_RUN" : "LIVE",
            // Block all bots except the following
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                // Uncomment to allow these other common bot categories
                // See the full list at https://arcjet.com/bot-list
                //"CATEGORY:MONITOR", // Uptime monitoring services
                //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
            ],
        }),
        // Create a token bucket rate limit. Other algorithms are supported.
        slidingWindow({
            mode: "LIVE",
            // Tracked by IP address by default, but this can be customized
            // See https://docs.arcjet.com/fingerprints
            //characteristics: ["ip.src"],
            interval: 60, // 10 seconds
            max: 100, // Allow 10 requests per interval
        }),
    ],
});

export default aj;