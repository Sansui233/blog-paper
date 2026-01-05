import { dateI18n, parseDate } from "lib/date";
import { Folder, Tag as TagIcon } from "lucide-react";
import { Link } from "react-router";

type Props = {
  date: string;
  categories?: string | null;
  tags?: string[] | null;
};

export function PostMeta({ date, categories, tags = [] }: Props) {
  // const formattedDate = dateI18n(parseDate(date)); // 保留备用
  const formattedDate = dateI18n(parseDate(date), "dateNatural");

  return (
    <>
      {/* Date */}
      <div className="mt-4 text-center text-sm font-semibold text-[#989898]">
        {formattedDate}
      </div>

      {/* Categories and Tags */}
      <div className="mt-4 mb-6 pb-6 text-center text-sm font-semibold">
        <div className="inline-block max-w-1/2">
          {/* Category */}
          {categories && (
            <span className="pr-2 text-sm leading-6">
              <Link
                to={`/categories/${categories}`}
                className="text-text-primary hover:text-accent transition-colors"
              >
                <Folder size="1.1em" className="mr-0.5 ml-2 inline pb-0.5" />
                {categories}
              </Link>
            </span>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <span className="text-sm leading-none">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/tags/${tag}`}
                  className="bg-tag-bg text-text-secondary hover:bg-accent-hover m-px inline-block rounded-full px-2 py-1 transition-colors"
                >
                  <TagIcon size="0.875em" className="mr-0.5 inline" />
                  {tag}
                </Link>
              ))}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
