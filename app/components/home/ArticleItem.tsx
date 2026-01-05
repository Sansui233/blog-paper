import { dateI18n, parseDate } from "lib/date";
import { Folder } from "lucide-react";
import { Link } from "react-router";
import "./ArticleItem.css";

type PostType = {
  slug: string;
  date: string;
  title?: string;
  categories?: string | null;
  description?: string | null;
};

type Props = {
  post: PostType;
  index: number;
};

export default function ArticleItem({ post, index }: Props) {
  return (
    <Link
      to={`/posts/${post.slug}`}
      className="article-card group block min-h-24 cursor-pointer relative max-md:min-h-21"
    >
      <div className="py-4 pb-10 relative">
        {/* Meta: date + category */}
        <div className="my-2 text-text-gray-2">
          <span className="font-medium text-sm">
            {dateI18n(parseDate(post.date), "dateNatural")}
          </span>
          <Folder size="1em" className="inline ml-2 mr-1 mb-0.5" />
          <span className="font-medium text-sm inline-block">
            {post.categories}
          </span>
        </div>

        {/* Title + Description container with hover effect */}
        <div className="post-container">
          {/* Title */}
          <span className="title text-xl font-semibold max-md:text-xl">
            {post.title}
          </span>

          {/* Description */}
          <div className="my-2 text-text-secondary">{post.description}</div>
        </div>
      </div>
    </Link>
  );
}
