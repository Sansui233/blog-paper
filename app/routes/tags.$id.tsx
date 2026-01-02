import { groupByYear, posts_db } from "lib/data/server/posts";
import TLContent from "~/components/categories/Timeline";
import LayoutContainer from "~/components/common/layout";
import type { Route } from "./+types/tags.$id";

export function loader({ params }: Route.LoaderArgs) {
  const tag = params.id;
  const posts = posts_db.inTag(tag);

  return {
    tag,
    posts: groupByYear(posts),
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Tag - ${data.tag}` },
    { name: "description", content: `Posts tagged with: ${data.tag}` },
  ];
}

export default function TagPage({ loaderData }: Route.ComponentProps) {
  const { tag, posts } = loaderData;

  return (
    <LayoutContainer>
      <TLContent mode="tag" title={tag} posts={posts} />
    </LayoutContainer>
  );
}
