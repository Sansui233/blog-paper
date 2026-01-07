import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";

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
      {prevPost && (
        <div className="flex-[1_1_auto]">
          <Link
            to={`/posts/${prevPost.slug}`}
            className="group inline-flex items-center justify-start py-1"
          >
            <ArrowLeft size="1em" />
            <span className="relative mx-2">
              {prevPost.title}
              <span className="bg-accent-hover absolute bottom-0 left-0 h-0.5 w-0 rounded transition-[width] duration-1000 ease-[cubic-bezier(0.34,0.04,0.03,1.4)] group-hover:w-full" />
            </span>
          </Link>
        </div>
      )}

      {nextPost && (
        <div className="flex-[1_1_auto]">
          <Link
            to={`/posts/${nextPost.slug}`}
            className="group inline-flex w-full items-center justify-end py-1"
          >
            <span className="relative mx-2">
              {nextPost.title}
              <span className="bg-accent-hover absolute bottom-0 left-0 h-0.5 w-0 rounded transition-[width] duration-1000 ease-[cubic-bezier(0.34,0.04,0.03,1.4)] group-hover:w-full" />
            </span>
            <ArrowRight size="1em" />
          </Link>
        </div>
      )}
    </div>
  );
}
