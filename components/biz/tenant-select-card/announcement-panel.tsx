import { useState, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TenantInfo } from '@/types/tenant';

type Announcement = NonNullable<TenantInfo['announcements']>[number];

interface AnnouncementPanelProps {
  announcements: Announcement[];
}

marked.use({ breaks: true, gfm: true });

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

function renderMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html);
}

export const AnnouncementPanel = ({ announcements }: AnnouncementPanelProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sorted = useMemo(
    () =>
      [...announcements].sort(
        (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
      ),
    [announcements],
  );

  if (sorted.length === 0) return null;

  const current = sorted[currentIndex];
  const total = sorted.length;
  const showNav = total > 1;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{formatDate(current.publishDate)}</span>
        {showNav && (
          <div className="flex items-center gap-0.5">
            <span className="text-muted-foreground tabular-nums">
              {currentIndex + 1}/{total}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              className="size-5"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={currentIndex === total - 1}
              className="size-5"
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        )}
      </div>
      <div
        className="text-foreground text-xs [&_a]:underline [&_p+p]:mt-1.5 [&_p]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(current.content) }}
      />
    </div>
  );
};
