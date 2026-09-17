import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

/*
 * In-page PDF rendering.
 *
 * The previous viewer handed the file's address to docs.google.com and let it
 * render inside a cross-origin iframe. That had three problems: Google has to
 * be able to reach the URL, which it cannot in development; the frame carried
 * its own "open in new window" and download affordances; and because the
 * document belonged to another origin, none of our keyboard or print handling
 * could reach it.
 *
 * Here the bytes are fetched, decoded, and painted onto canvases. What ends up
 * in the DOM is a bitmap of each page. There is no document URL to copy, no
 * "Save as PDF" in the context menu, and the print stylesheet applies because
 * the pages are ours.
 *
 * The text layer is deliberately not rendered — it would restore selection and
 * copy, and its absence is also why the pages are not machine-readable.
 *
 * The honest limit: the bytes were in the browser to be drawn, so anyone able
 * to open devtools can still recover them. This removes the one-click paths,
 * not the possibility.
 */

// Served from public/ rather than bundled: CRA's webpack config does not
// handle pdf.js's worker entry cleanly, and a static file avoids the problem.
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;

const SecurePdfViewer = ({ url, onUnsupported }) => {
  const containerRef = useRef(null);
  const docRef = useRef(null);
  const renderTokenRef = useRef(0);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [pageCount, setPageCount] = useState(0);
  const [message, setMessage] = useState('');

  /* Pages are drawn at the container's width times the device pixel ratio, so
     text stays sharp on high-density screens without rendering every page at a
     fixed large scale. */
  const renderAll = useCallback(async (pdf, token) => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const width = container.clientWidth || 800;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      // A newer render started (resize, or a different deck) — abandon this one.
      if (token !== renderTokenRef.current) return;

      const page = await pdf.getPage(pageNumber);
      const unscaled = page.getViewport({ scale: 1 });
      const scale = width / unscaled.width;
      const viewport = page.getViewport({ scale: scale * dpr });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.className = 'spv__page';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Page ${pageNumber} of ${pdf.numPages}`);

      container.appendChild(canvas);

      await page.render({
        canvasContext: canvas.getContext('2d', { alpha: false }),
        viewport
      }).promise;
    }
  }, []);

  useEffect(() => {
    if (!url) return undefined;

    let cancelled = false;
    const token = renderTokenRef.current + 1;
    renderTokenRef.current = token;

    setStatus('loading');
    setMessage('');

    (async () => {
      try {
        const task = pdfjsLib.getDocument({
          url,
          // The deck is not a trusted document: no embedded fonts from other
          // origins, no scripting, no external resources.
          isEvalSupported: false,
          disableAutoFetch: false
        });

        const pdf = await task.promise;
        if (cancelled || token !== renderTokenRef.current) {
          pdf.destroy();
          return;
        }

        docRef.current = pdf;
        setPageCount(pdf.numPages);
        await renderAll(pdf, token);

        if (!cancelled && token === renderTokenRef.current) setStatus('ready');
      } catch (err) {
        if (cancelled) return;

        // A PowerPoint file is not a PDF and never will be; that is a content
        // problem, not a failure of this component, so the caller decides.
        const looksNotPdf =
          err?.name === 'InvalidPDFException' ||
          /invalid pdf/i.test(err?.message || '');

        if (looksNotPdf && onUnsupported) {
          onUnsupported();
          return;
        }

        console.error('PDF render failed:', err);
        setStatus('error');
        setMessage('This presentation could not be displayed.');
      }
    })();

    return () => {
      cancelled = true;
      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }
    };
  }, [url, renderAll, onUnsupported]);

  /* Re-render on width changes so the pages stay crisp rather than stretched. */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return undefined;

    let last = container.clientWidth;
    let timer = null;

    const observer = new ResizeObserver(() => {
      const next = container.clientWidth;
      if (!next || Math.abs(next - last) < 40) return;
      last = next;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (docRef.current) {
          const token = renderTokenRef.current + 1;
          renderTokenRef.current = token;
          renderAll(docRef.current, token);
        }
      }, 180);
    });

    observer.observe(container);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [renderAll]);

  return (
    <div className="spv">
      {status === 'loading' && (
        <div className="spv__state">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-gray-500">Loading presentation…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="spv__state">
          <p className="text-sm text-red-600">{message}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="spv__pages"
        onContextMenu={(e) => e.preventDefault()}
      />

      {status === 'ready' && pageCount > 0 && (
        <p className="spv__count">{pageCount} page{pageCount === 1 ? '' : 's'}</p>
      )}
    </div>
  );
};

export default SecurePdfViewer;
