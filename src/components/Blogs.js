import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/substack/feed`);
        if (response.data.success) {
          setBlogs(response.data.data.items.slice(0, 3));
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section id="blogs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Blog Posts</h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading articles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No blogs to show up / something went wrong please try again later.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {blogs.map((blog, index) => (
                  <a
                    href={blog.link}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                      <h3 className="text-xl font-medium text-gray-900 group-hover:text-crimson-600 transition-colors mb-2">
                        {blog.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{blog.author}</span>
                        <span>•</span>
                        <span>{blog.pubDate}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <a
                href="https://substack.com/@janakiramsharma"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-crimson-600 hover:text-crimson-700 transition"
              >
                <span className="mr-2">View all articles on Substack</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Blogs;