import type { WalineComment } from "@waline/client";
import { Loader2, MessageSquare, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { siteInfo } from "site.config";
import { CardCommon } from "./Sidebar";

interface CommentCardProps {
  onOpenComment: (e: React.MouseEvent) => void;
}

export function CommentCard({ onOpenComment }: CommentCardProps) {
  const { t } = useTranslation();

  const [comments, setComments] = useState<
    Array<Pick<WalineComment, "objectId" | "comment">>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!siteInfo.walineApi) {
      setIsLoading(false);
      return;
    }

    const path = encodeURIComponent(globalThis.location.pathname);
    fetch(
      `${siteInfo.walineApi}/comment?path=${path}&pageSize=10&page=1&lang=en-US&sortBy=insertedAt_desc`,
    )
      .then((res) => res.json())
      .then((data) => {
        setComments(data.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (!siteInfo.walineApi) return null;

  return (
    <CardCommon title={t("ui.latestComments")} Icon={MessageSquare}>
      {/* Comment list - font-size: 0.9rem, line height: 1.5em */}
      <div>
        {isLoading ? (
          <div className="text-text-gray-3 flex items-center gap-2">
            <Loader2 size="1em" className="animate-spin" />
            {t("ui.loading")}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-text-gray-3">{t("ui.noComments")}</div>
        ) : (
          <ul className="m-0 list-none ps-0">
            {comments.map((item) => (
              <li
                key={item.objectId}
                className="inline-st h-6 overflow-hidden text-[0.9rem]"
              >
                {item.comment.replace(/<[^>]*>/g, "")}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={onOpenComment}
        className="bg-bg border-ui-line-gray-2 text-text-secondary hover:text-accent mt-8 flex max-w-full cursor-pointer items-center rounded-lg border px-4 py-2 font-semibold shadow-[0_0_12px_0_var(--shadow-bg)] transition-all hover:shadow-[0_0_12px_0_var(--accent-hover)] max-[780px]:max-w-none max-[780px]:bg-[var(--bg-2)]"
      >
        <PencilLine size="1em" className="mr-2" />
        <span>{t("ui.addComment")}</span>
      </button>
    </CardCommon>
  );
}

export default CommentCard;
