import TLContent from "~/components/categories/Timeline";
import LayoutContainer from "~/components/common/layout";
import type { Route } from "./+types/categories.$id";

export async function loader({ params }: Route.LoaderArgs) {
  const { posts_db, groupByYear } = await import("lib/data/server/posts");
  const category = params.id;
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

  return (
    <LayoutContainer>
      <TLContent mode="category" title={category} posts={posts} />
    </LayoutContainer>
  );
}
