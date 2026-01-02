import { Folder, Tag as TagIcon } from 'lucide-react';
import { Link } from 'react-router';

type Props = {
  date: string;
  categories?: string | null;
  tags?: string[] | null;
};

export function PostMeta({ date, categories, tags = [] }: Props) {
  // const formattedDate = dateI18n(parseDate(date)); // 保留备用
  const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Date */}
      <div className="mt-4 text-center text-sm font-semibold text-[#989898]">
        {formattedDate}
      </div>

      {/* Categories and Tags */}
      <div className="mt-4 pb-6 mb-6 text-sm font-semibold text-center">
        <div className="inline-block max-w-1/2">
          {/* Category */}
          {categories && (
            <span className="text-sm leading-6 pr-2">
              <Link
                to={`/categories/${categories}`}
                className="text-text-primary transition-colors hover:text-accent"
              >
                <Folder
                  size="1.1em"
                  className="inline ml-2 mr-0.5 pb-0.5"
                />
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
                  className="
                    inline-block m-px px-2 py-1 rounded-full
                    bg-tag-bg text-text-secondary
                    transition-colors hover:bg-accent-hover
                  "
                >
                  <TagIcon size="0.875em" className="inline mr-0.5" />
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
