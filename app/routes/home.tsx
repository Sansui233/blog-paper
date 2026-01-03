import { useMemo, useState } from "react";
import { siteInfo } from "site.config";
import LayoutContainer, { OneColLayout } from "~/components/common/layout";
import ArticleItem from "~/components/home/ArticleItem";
import NavCat from "~/components/home/NavCat";
import type { Route } from "./+types/home";

export async function loader() {
  const { posts_db } = await import("lib/data/server/posts");
  return {
    posts: posts_db.velite.map((p) => ({
      slug: p.slug,
      date: p.date,
      title: p.title,
      categories: p.categories,
      description: p.description,
    })),
    categories: Array.from(posts_db.categories.entries()),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${siteInfo.author} - Blog` },
    { name: "description", content: "A personal blog about work and life" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts, categories } = loaderData;
  const [currCategory, setCurrCategory] = useState(0);

  const filteredPosts = useMemo(() => {
    if (currCategory === 0) {
      return posts;
    }
    return posts.filter((p) => p.categories === categories[currCategory][0]);
  }, [currCategory, posts, categories]);

  return (
    <LayoutContainer>
      <OneColLayout>
        <NavCat
          items={categories}
          current={currCategory}
          setCurrent={setCurrCategory}
        />
        <section className="animate-bottom-fade-in grid grid-cols-2 justify-center gap-x-16 max-md:grid-cols-1">
          {filteredPosts.map((post, i) => (
            <ArticleItem key={post.slug} post={post} index={i} />
          ))}
        </section>
      </OneColLayout>
    </LayoutContainer>
  );
}
