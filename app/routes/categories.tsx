import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { siteInfo } from "site.config";
import { CategoryTitle } from "~/components/categories/Timeline";
import { OneColLayout } from "~/components/common/layout";
import type { Route } from "./+types/categories";

export async function loader() {
  const { posts_db } = await import("lib/data/server/posts");

  return {
    categories: Object.fromEntries(posts_db.categories),
    tags: Object.fromEntries(posts_db.tags),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${siteInfo.author}'s Blog - Categories` },
    { name: "description", content: "Blog categories and tags" },
  ];
}

export default function CategoriesIndex({ loaderData }: Route.ComponentProps) {
  const { categories, tags } = loaderData;
  const { t } = useTranslation();

  return (
    <OneColLayout className="max-sm:px-12 max-sm:pb-12">
      {/* Categories Section */}
      <CategoryTitle>
        <span className="opacity-50">CATEGORIES</span>
        <h1 className="mt-2 mb-0">分类</h1>
      </CategoryTitle>
      <div className="flex flex-wrap content-start items-center justify-center">
        <Link
          key="all"
          to={`/categories/all`}
          className="bg-tag-bg m-1.5 rounded-full px-4 py-1.5 text-sm opacity-80 transition-all duration-300 hover:scale-115 hover:opacity-100"
        >
          {`${t("ui.allPosts")}(${Object.values(categories).reduce((a, b) => a + b, 0)})`}
        </Link>
        {Object.keys(categories).map((k) => (
          <Link
            key={k}
            to={`/categories/${k}`}
            className="bg-tag-bg m-1.5 rounded-full px-4 py-1.5 text-sm opacity-80 transition-all duration-300 hover:scale-115 hover:opacity-100"
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
      <div className="flex flex-wrap content-start items-center justify-center">
        {Object.keys(tags).map((k) => {
          if (tags[k] === 0) return null;
          return (
            <Link
              key={k}
              to={`/tags/${k}`}
              className="bg-tag-bg m-1.5 rounded-full px-4 py-1.5 text-sm opacity-80 transition-all duration-300 hover:scale-115 hover:opacity-100"
            >
              {`${k}(${tags[k]})`}
            </Link>
          );
        })}
      </div>
    </OneColLayout>
  );
}
