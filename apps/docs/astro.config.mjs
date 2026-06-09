// @ts-check
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import dotenv from "dotenv";
import starlightThemeBlack from "starlight-theme-black";

// Load Environment Variables
dotenv.config({ path: ".env.local" });

// Fallbacks to prevent crashes if .env.local is missing
const SITE_TITLE = process.env.PUBLIC_SITE_TITLE || "LightRender";
const SITE_DESCRIPTION =
    process.env.PUBLIC_SITE_DESCRIPTION || "High-performance, unified video rendering engine.";
const GITHUB_URL =
    process.env.PUBLIC_GITHUB_URL || "https://github.com/sikandarmoyaldev/lightrender";
const TWITTER_URL = process.env.PUBLIC_TWITTER_URL || "https://twitter.com/skmoyaldev";
const GITHUB_REPO_URL =
    process.env.PUBLIC_GITHUB_REPO_URL || "https://github.com/sikandarmoyaldev/lightrender";
const GITHUB_OWNER_NAME = process.env.GITHUB_OWNER_NAME || "Sikandar";
const GITHUB_OWNER_URL = process.env.GITHUB_OWNER_URL || "https://github.com/sikandarmoyaldev";

export default defineConfig({
    integrations: [
        react(),
        starlight({
            title: SITE_TITLE,
            description: SITE_DESCRIPTION,
            customCss: ["./src/styles/globals.css"],
            editLink: {
                baseUrl: `${GITHUB_REPO_URL}/tree/main/apps/docs/src/content/docs/`,
            },
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: GITHUB_URL,
                },
                {
                    icon: "x.com",
                    label: "X",
                    href: TWITTER_URL,
                },
            ],
            sidebar: [
                // {
                //     label: "Getting Started",
                //     items: [
                //         { label: "Introduction", slug: "getting-started/introduction" },
                //         { label: "Installation", slug: "getting-started/installation" },
                //     ],
                // },
                // {
                //     label: "Effects Registry",
                //     autogenerate: { directory: "effects" },
                // },
                // {
                //     label: "Properties",
                //     autogenerate: { directory: "properties" },
                // },
                // {
                //     label: "Contributing",
                //     items: [
                //         { label: "Introduction", slug: "contributing" },
                //         { label: "Component Request", slug: "contributing/component-request" },
                //         { label: "Feature Request", slug: "contributing/feature-request" },
                //         { label: "Contributing Code", slug: "contributing/contributing-code" },
                //     ],
                // },
            ],
            plugins: [
                starlightThemeBlack({
                    navLinks: [
                        // { label: "Docs", link: "/getting-started/installation" },
                        // { label: "Effects", link: "/effects" },
                        // { label: "Contributing", link: "/contributing" },
                    ],
                    footerText: `Built by [${GITHUB_OWNER_NAME}](${GITHUB_OWNER_URL}) for the ${SITE_TITLE} engine.`,
                }),
            ],
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
        ssr: {
            noExternal: ["zod"],
        },
    },
    env: {
        schema: {
            // Marked as optional so Astro doesn't crash if the .env file is missing
            PUBLIC_SITE_URL: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_SITE_TITLE: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_GITHUB_URL: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_GITHUB_REPO_NAME: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_GITHUB_OWNER_NAME: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_GITHUB_OWNER_URL: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_TWITTER_URL: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_GITHUB_REPO_URL: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_SITE_SHORT_TITLE: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
            PUBLIC_SITE_DESCRIPTION: envField.string({
                context: "client",
                access: "public",
                optional: true,
            }),
        },
    },
});
