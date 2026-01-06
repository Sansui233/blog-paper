import TLContent from "~/components/categories/Timeline";
import type { Route } from "./+types/categories.$id";

export async function loader({ params }: Route.LoaderArgs) {
  const { posts_db, groupByYear } = await import("lib/data/server/posts");
  const category = params.id;

  if (category === "all") {
    const posts = posts_db.velite.map((p) => {
      return {
        slug: p.slug,
        title: p.title,
        date: p.date,
      };
    });
    return {
      category: "All Posts",
      posts: groupByYear(posts),
    };
  }
  const posts = posts_db.inCategory(category);

  return {
    category,
    posts: groupByYear(posts),
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `Category - ${loaderData.category}` },
    {
      name: "description",
      content: `Posts in category: ${loaderData.category}`,
    },
  ];
}

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  const { category, posts } = loaderData;

  return <TLContent mode="category" title={category} posts={posts} />;
}
