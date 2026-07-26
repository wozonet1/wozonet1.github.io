import type { APIRoute } from "astro";

const siteVersion = import.meta.env.PUBLIC_SITE_VERSION ?? "development";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ version: siteVersion }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
