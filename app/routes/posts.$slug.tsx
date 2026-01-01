// app/routes/blog.$slug.tsx
import { MDImg } from '~/components/markdown/MDImg';
import { MDXContent } from '~/components/markdown/MDXComponent';
import { posts } from '../../.velite';
import type { Route } from './+types/posts.$slug';


export async function loader({ params }: Route.LoaderArgs) {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) throw new Response('Not Found', { status: 404 })
  return { post }
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData

  return (
    <article className="markdown-wrapper mx-auto p-6">
      <h1>{post.title}</h1>

      <MDXContent
        code={post.content_jsx}
        components={{
          img: MDImg
        }}
      />
    </article>
  )
}
