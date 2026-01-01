import { rehypeHeadingsAddId } from 'lib/rehype/rehype-toc'
import { remarkUnrwrapImages } from 'lib/remark/remark-unwrap-images'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { defineConfig, s } from 'velite'

// `s` is extended from Zod with some custom schemas,
// you can also import re-exported `z` from `velite` if you don't need these extension schemas.

export default defineConfig({
  mdx: {
    remarkPlugins: [remarkGfm, remarkUnrwrapImages],
    rehypePlugins: [rehypeHeadingsAddId, rehypeHighlight],
  },
  collections: {
    posts: {
      name: 'Post', // collection type name
      pattern: 'posts/*.md', // content files glob pattern
      schema: s
        .object({
          title: s.string().max(99), // Zod primitive type
          slug: s.path().transform(p => encodeURI(p.split('/').pop()!)), // url
          // slug: s.path(), // auto generate slug from file path
          date: s.isodate(), // input Date-like string, output ISO Date string.
          description: s.string().optional(),
          cover: s.image().optional(), // input image relative path, output image object with blurImage.
          draft: s.boolean().default(false),
          metadata: s.metadata(), // extract markdown reading-time, word-count, etc.
          excerpt: s.excerpt(), // excerpt of markdown content
          content_html: s.markdown(), // transform markdown to html
          content_jsx: s.mdx(), // transform markdown to MDX component
          toc: s.toc({ maxDepth: 3 }), // generate table of contents from markdown headings
          tags: s.array(s.string()).default([]), // array of strings
          categories: s.string().optional()
        })
        // more additional fields (computed fields)
        .transform(data => ({ ...data, permalink: `/posts/${data.slug}` }))
    }
  }
})