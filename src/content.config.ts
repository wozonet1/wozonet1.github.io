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
        accent: z.string().default("#a8b8ff"),
        overlay: z.number().min(0).max(1).default(0.84),
      })
      .default({
        backgroundPosition: "center",
        accent: "#a8b8ff",
        overlay: 0.84,
      }),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string().default("今日小记"),
    weather: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, notes };
