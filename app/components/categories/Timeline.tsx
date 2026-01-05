import { Link } from "react-router";
import { OneColLayout } from "~/components/common/layout";
import "./Timeline.css";

/**
 * Timeline content for tag and category pages
 */

type Props = {
  mode: "tag" | "category";
  title: string;
  posts: {
    [year: string]: {
      slug: string;
      title: string;
      date: string;
    }[];
  };
};

export default function TLContent({ mode, title, posts }: Props) {
  return (
    <OneColLayout className="max-sm:px-12 max-sm:pb-12">
      {/* Title */}
      <div className="mx-auto py-12 pb-4 text-center">
        <Link
          to="/categories"
          className="opacity-50 transition-opacity hover:opacity-100"
        >
          {mode.toUpperCase()}
        </Link>
        <h1 className="mt-2 mb-0">{title}</h1>
      </div>

      {/* Timeline sections by year */}
      {Object.keys(posts)
        .sort((a, b) => (a < b ? 1 : -1))
        .map((year) => (
          <section key={year} className="my-8 flex max-md:flex-col">
            {/* Year */}
            <div className="flex-1 text-3xl font-bold max-md:text-2xl">
              {year}
            </div>

            {/* Posts list */}
            <ul className="tl-posts-container my-0.5 flex-[2.5_1_0] pl-6 max-md:my-4">
              {posts[year].map((p) => (
                <li
                  key={p.slug}
                  className="relative block before:absolute before:-left-6 before:pr-4 before:content-['•']"
                >
                  <Link to={`/posts/${p.slug}`}>{p.title}</Link>
                  <span className="text-text-gray px-2 text-sm">
                    {p.date.slice(5, 10)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </OneColLayout>
  );
}

/**
 * Category/Tag title component for index page
 */
export function CategoryTitle({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto py-12 pb-4 text-center">{children}</div>;
}
