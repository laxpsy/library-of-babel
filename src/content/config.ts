import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

const books = defineCollection({
  type: "data",
  schema: z.object({
    links: z.array(z.object({
        link: z.string(),
        display_text: z.string(),
    }))
  })
})


export const collections = { blog, books };
