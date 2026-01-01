import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

type PageLink = {
  title: string;
  slug: string;
};

type Props = {
  prevPost?: PageLink | null;
  nextPost?: PageLink | null;
};

export function Pagination({ prevPost, nextPost }: Props) {
  return (
    <div className="my-16 flex flex-wrap items-center justify-between">
      {prevPost ? (
        <div className="flex-1">
          <Link
            to={`/posts/${prevPost.slug}`}
            className="group inline-flex items-center py-1"
          >
            <ArrowLeft size="1em" className="-translate-y-px" />
            <span className="relative mx-2">
              {prevPost.title}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded bg-accent-hover transition-[width] duration-1000 ease-[cubic-bezier(0.34,0.04,0.03,1.4)] group-hover:w-full" />
            </span>
          </Link>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {nextPost ? (
        <div className="flex-1">
          <Link
            to={`/posts/${nextPost.slug}`}
            className="group inline-flex items-center justify-end py-1 w-full"
          >
            <span className="relative mx-2">
              {nextPost.title}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded bg-accent-hover transition-[width] duration-1000 ease-[cubic-bezier(0.34,0.04,0.03,1.4)] group-hover:w-full" />
            </span>
            <ArrowRight size="1em" className="-translate-y-px" />
          </Link>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
