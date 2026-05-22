import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()),
    summary: z.string().optional(),
    description: z.string().optional(),
    worldline: z.string().optional(),
    tone: z.string().optional(),
    relatedProjects: z.array(z.string()).default([]),
    readingTime: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { articles };
