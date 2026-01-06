import TLContent from "~/components/categories/Timeline";
import type { Route } from "./+types/tags.$id";

export async function loader({ params }: Route.LoaderArgs) {
  const { posts_db, groupByYear } = await import("lib/data/server/posts");
  const tag = params.id;
  const posts = posts_db.inTag(tag);

  return {
    tag,
    posts: groupByYear(posts),
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `Tag - ${loaderData.tag}` },
    { name: "description", content: `Posts tagged with: ${loaderData.tag}` },
  ];
}

export default function TagPage({ loaderData }: Route.ComponentProps) {
  const { tag, posts } = loaderData;

  return <TLContent mode="tag" title={tag} posts={posts} />;
}
