import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScholar } from '../lib/useScholar';
import useArchivynContent from '../lib/useArchivynContent';

export default function PortfolioMetadata() {
  const { scholar } = useScholar();
  const { content } = useArchivynContent();
  const { pathname } = useLocation();

  useEffect(() => {
    const projectPage = pathname === '/proj-arch' && content?.page;
    if (!projectPage && !scholar.name) return;
    const title = projectPage
      ? [content.brand, projectPage.metadataTitle].filter(Boolean).join(' | ')
      : [scholar.name, scholar.tagline].filter(Boolean).join(' | ');
    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="author"]')?.setAttribute('content', scholar.name);
    const description = projectPage ? projectPage.description : scholar.about?.lead;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    }
  }, [scholar, content, pathname]);

  return null;
}
