import { useRef, useState } from 'react';
import LayoutContainer from '~/components/layout';
import { MDImg } from '~/components/markdown/MDImg';
import { MDXContent } from '~/components/markdown/MDXComponent';
import { FloatButtons } from '~/components/post/FloatButtons';
import { Pagination } from '~/components/post/Pagination';
import { PostMeta } from '~/components/post/PostMeta';
import { TableOfContents } from '~/components/post/TableOfContents';
import { useTocHighlight } from '~/hooks/useTocHighlight';
import { posts } from '../../.velite';
import type { Route } from './+types/posts.$slug';

// Sort posts by date (newest first) for consistent prev/next navigation
const sortedPosts = [...posts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export async function loader({ params }: Route.LoaderArgs) {
  const currentIndex = sortedPosts.findIndex(p => p.slug === params.slug);
  if (currentIndex === -1) throw new Response('Not Found', { status: 404 });

  const post = sortedPosts[currentIndex];

  // Prev = newer post (lower index), Next = older post (higher index)
  const prevPost = currentIndex > 0
    ? { title: sortedPosts[currentIndex - 1].title, slug: sortedPosts[currentIndex - 1].slug }
    : null;
  const nextPost = currentIndex < sortedPosts.length - 1
    ? { title: sortedPosts[currentIndex + 1].title, slug: sortedPosts[currentIndex + 1].slug }
    : null;

  return { post, prevPost, nextPost };
}

export function meta({ data }: Route.MetaArgs) {
  const { post } = data;
  const description = post.description || post.excerpt?.slice(0, 160) || '';

  return [
    { title: post.title },
    { name: 'description', content: description },
  ];
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post, prevPost, nextPost } = loaderData;
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const { flatItems, currentIndex, isViewing, scrollTo } = useTocHighlight(
    post.toc,
    contentRef
  );

  return (
    <LayoutContainer>
      {/* Main article */}
      <article
        className="
          mx-auto px-5 py-15
          w-170
          max-xl:w-[calc(100%-480px)] max-xl:max-w-170
          max-lg:w-auto max-lg:max-w-170
          max-sm:w-full max-sm:py-12
        "
      >
        <h1 className="mt-0 mb-0 text-center">{post.title}</h1>
        <PostMeta
          date={post.date}
          categories={post.categories}
          tags={post.tags}
        />
        <div ref={contentRef} className="markdown-wrapper">
          <MDXContent
            code={post.content_jsx}
            components={{
              img: MDImg,
            }}
          />
        </div>

        <section>
          <div className="text-right text-sm opacity-50 mt-16">
            更新于 {post.date.split('T')[0]}
          </div>
        </section>

        <Pagination prevPost={prevPost} nextPost={nextPost} />
      </article>

      <TableOfContents
        flatItems={flatItems}
        currentIndex={currentIndex}
        isViewing={isViewing}
        isMobileOpen={isMobileTocOpen}
        onClose={() => setIsMobileTocOpen(false)}
        onScrollTo={scrollTo}
      />

      {/* Float buttons */}
      <FloatButtons
        isViewing={isViewing}
        onTocToggle={() => setIsMobileTocOpen(v => !v)}
      />
    </LayoutContainer>
  );
}
