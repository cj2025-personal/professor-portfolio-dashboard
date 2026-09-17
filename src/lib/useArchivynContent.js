import { useEffect, useState } from 'react';

let contentRequest;

// Brand copy is maintained in public/content/archivyn.json, independently
// of the components and the scholar's profile record.
export default function useArchivynContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!contentRequest) {
      contentRequest = fetch(`${process.env.PUBLIC_URL || ''}/content/archivyn.json`)
        .then(response => {
          if (!response.ok) throw new Error('Content unavailable');
          return response.json();
        })
        .catch(() => {
          contentRequest = null;
          return null;
        });
    }
    contentRequest.then(data => {
      if (!cancelled) {
        setContent(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { content, loading };
}
