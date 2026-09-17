import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useScholar } from '../lib/useScholar';

const decodeEntities = value => {
  const element = document.createElement('textarea');
  element.innerHTML = value || '';
  return element.value;
};

const formatDate = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

function ArticleLink({ post, featured = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(post.coverImage) && !imageFailed;
  const date = formatDate(post.pubDate);
  const excerpt = post.contentSnippet || post.content;

  return (
    <article className={`writing-article ${featured ? 'writing-article--featured' : 'writing-article--row'} ${hasImage ? 'writing-article--with-image' : ''}`}>
      <a href={post.link} target="_blank" rel="noopener noreferrer" aria-label={`Read ${post.title} on Substack (opens in a new tab)`}>
        <div className="writing-article__copy">
          <div className="writing-article__meta">
            {featured && <span className="writing-article__latest">Latest</span>}
            {date && <time dateTime={new Date(post.pubDate).toISOString()}>{date}</time>}
            {post.categories?.length > 0 && <span>{post.categories.slice(0, 2).join(' / ')}</span>}
          </div>
          <h3>{post.title}</h3>
          {excerpt && <p className="writing-article__excerpt">{excerpt}</p>}
          <div className="writing-article__bottom">
            {post.author && <span className="writing-article__author">{post.author}</span>}
            <span className="writing-article__action">Read article <ArrowUpRightIcon aria-hidden="true" /></span>
          </div>
        </div>
        {hasImage && <div className="writing-article__cover"><img src={post.coverImage} alt="" loading="lazy" onError={() => setImageFailed(true)} /></div>}
      </a>
    </article>
  );
}

function FeedSkeleton() {
  return <div className="writing-skeleton" role="status" aria-label="Loading articles">
    <div className="writing-skeleton__featured" aria-hidden="true"><span /><span /><span /></div>
    <div className="writing-skeleton__row" aria-hidden="true"><span /><span /></div>
    <div className="writing-skeleton__row" aria-hidden="true"><span /><span /></div>
  </div>;
}

export default function Blogs() {
  const { scholar } = useScholar();
  const [blogs, setBlogs] = useState([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileUrl = scholar.linksAndMedia?.socialProfiles?.find(profile => profile.platform?.toLowerCase() === 'substack')?.url;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/substack/feed`, { signal: controller.signal });
        const feed = response.data?.data;
        if (!response.data?.success || !Array.isArray(feed?.items)) throw new Error('Feed unavailable');
        setDescription(decodeEntities(feed.feedDescription));
        setBlogs(feed.items.filter(item => item.title && item.link).slice(0, 3).map(item => ({
          ...item,
          title: decodeEntities(item.title),
          author: decodeEntities(item.author),
          contentSnippet: decodeEntities(item.contentSnippet),
          content: decodeEntities(item.content),
          categories: item.categories?.map(decodeEntities),
        })));
      } catch (_) {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const [featured, ...rest] = blogs;
  return (
    <section id="blogs" className="ark-section writing-section" aria-labelledby="writing-title">
      <div className="ark-container">
        <div className="sec-head writing-header">
          <div className="sec-head__row">
            <div><p className="sec-eyebrow">Writing</p><h2 id="writing-title" className="sec-title">From the Substack</h2>{description && <p className="sec-lead">{description}</p>}</div>
            {profileUrl && <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="writing-archive-link">All articles <ArrowUpRightIcon aria-hidden="true" /></a>}
          </div>
        </div>
        {loading ? <FeedSkeleton /> : error ? <div className="writing-empty" role="status"><p>We couldn’t load the latest articles right now. Please try again later.</p></div> : !featured ? <div className="writing-empty" role="status"><p>No articles have been published yet. Check back soon.</p></div> : <div className="writing-feed">
          <ArticleLink key={featured.link} post={featured} featured />
          {rest.length > 0 && <div className="writing-feed__recent">{rest.map(post => <ArticleLink key={post.link} post={post} />)}</div>}
        </div>}
      </div>
    </section>
  );
}
