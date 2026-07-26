import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    math: z.boolean().default(false),
    toc: z.boolean().default(true),
    appearance: z
      .object({
        backgroundImage: z.string().optional(),
        backgroundPosition: z.string().default("center"),
        accent: z.string().default("oklch(0.7966 0.1026 274.09)"),
        overlay: z.number().min(0).max(1).default(0.84),
      })
      .default({
        backgroundPosition: "center",
        accent: "oklch(0.7966 0.1026 274.09)",
        overlay: 0.84,
      }),
  }),
});

const moments = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/moments" }),
  schema: z.object({
    weather: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const dailyNotes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/daily-notes" }),
  schema: z.object({
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, moments, dailyNotes };
