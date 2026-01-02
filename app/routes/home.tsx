import { posts_db } from "lib/data/server/posts";
import { useMemo, useState } from "react";
import LayoutContainer, { OneColLayout } from "~/components/common/layout";
import ArticleItem from "~/components/home/ArticleItem";
import NavCat from "~/components/home/NavCat";
import { siteInfo } from "../../site.config";
import type { Route } from "./+types/home";

export function loader() {
  return {
    posts: posts_db.velite.map((p) => ({
      id: p.slug,
      date: p.date,
      title: p.title,
      categories: p.categories,
      description: p.description,
    })),
    categories: Array.from(posts_db.categories.entries()),
  };
}

export function meta({ }: Route.MetaArgs) {
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
        <section
          className="
            grid justify-center
            grid-cols-2 gap-x-16
            animate-bottom-fade-in
            max-md:grid-cols-1
          "
        >
          {filteredPosts.map((post, i) => (
            <ArticleItem key={post.id} post={post} index={i} />
          ))}
        </section>
      </OneColLayout>
    </LayoutContainer>
  );
}
