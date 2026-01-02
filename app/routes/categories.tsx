import { posts_db } from "lib/data/server/posts";
import { Link } from "react-router";
import { CategoryTitle } from "~/components/categories/Timeline";
import LayoutContainer, { OneColLayout } from "~/components/common/layout";
import { siteInfo } from "../../site.config";
import type { Route } from "./+types/categories";

export function loader() {
  return {
    categories: Object.fromEntries(posts_db.categories),
    tags: Object.fromEntries(posts_db.tags),
  };
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: `${siteInfo.author}'s Blog - Categories` },
    { name: "description", content: "Blog categories and tags" },
  ];
}

export default function CategoriesIndex({ loaderData }: Route.ComponentProps) {
  const { categories, tags } = loaderData;

  return (
    <LayoutContainer>
      <OneColLayout className="max-sm:px-12 max-sm:pb-12">
        {/* Categories Section */}
        <CategoryTitle>
          <span className="opacity-50">CATEGORIES</span>
          <h1 className="mt-2 mb-0">分类</h1>
        </CategoryTitle>
        <div className="flex flex-wrap justify-center items-center content-start">
          {Object.keys(categories).map((k) => (
            <Link
              key={k}
              to={`/categories/${k}`}
              className="
                opacity-80 m-1.5 bg-tag-bg px-4 py-1.5 rounded-full
                transition-all duration-300 text-sm
                hover:opacity-100 hover:scale-115
              "
            >
              {`${k}(${categories[k]})`}
            </Link>
          ))}
        </div>

        {/* Tags Section */}
        <CategoryTitle>
          <span className="opacity-50">TAGS</span>
          <h1 className="mt-2 mb-0">标签</h1>
        </CategoryTitle>
        <div className="flex flex-wrap justify-center items-center content-start">
          {Object.keys(tags).map((k) => {
            if (tags[k] === 0) return null;
            return (
              <Link
                key={k}
                to={`/tags/${k}`}
                className="
                  opacity-80 m-1.5 bg-tag-bg px-4 py-1.5 rounded-full
                  transition-all duration-300 text-sm
                  hover:opacity-100 hover:scale-115
                "
              >
                {`${k}(${tags[k]})`}
              </Link>
            );
          })}
        </div>
      </OneColLayout>
    </LayoutContainer>
  );
}
