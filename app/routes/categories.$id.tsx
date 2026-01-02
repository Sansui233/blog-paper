import { groupByYear, posts_db } from "lib/data/server/posts";
import TLContent from "~/components/categories/Timeline";
import LayoutContainer from "~/components/common/layout";
import type { Route } from "./+types/categories.$id";

export function loader({ params }: Route.LoaderArgs) {
  const category = params.id;
  const posts = posts_db.inCategory(category);

  return {
    category,
    posts: groupByYear(posts),
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Category - ${data.category}` },
    { name: "description", content: `Posts in category: ${data.category}` },
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
