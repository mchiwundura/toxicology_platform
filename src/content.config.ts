import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			author: z.string().optional(),
			heroImage: z.optional(image()),
			bulletin: z.string().optional(),
			source: z.string().optional(),
		}),
});

const ce = defineCollection({
	loader: glob({ base: './src/content/ce', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			date: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			certificate: z.boolean().default(true),
			presentation: z.string().optional(),
		}),
});

export const collections = {
	blog,
	ce,
};
