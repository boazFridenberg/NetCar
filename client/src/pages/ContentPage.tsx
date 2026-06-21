
import { Navigate } from 'react-router-dom';
import { ContentPageLayout } from '@/components/content/ContentPageLayout';
import { CONTENT_PAGES, type ContentPageId } from '@/content/footerPages';

export function ContentPage({ pageId }: { pageId: ContentPageId }) {
  const page = CONTENT_PAGES[pageId];
  if (!page) return <Navigate to="/404" replace />;
  return <ContentPageLayout page={page} />;
}
