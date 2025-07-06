import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Research = () => {
  const [activeCategory, setActiveCategory] = useState('recent');

  const researchData = {
    recent: [
      {
        title: "Title-1",
        description: "Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra.",
        status: "Ongoing",
        year: "2023-Present"
      },
      {
        title: "Title-2",
        description: "Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra.",
        status: "Ongoing",
        year: "2022-Present"
      },
      {
        title: "Title-3",
        description: "Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra.",
        status: "Completed",
        year: "2021-2022"
      }
    ],
    past: [
      {
        title: "Past Research-1",
        description: "Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra.",
        status: "Completed",
        year: "2020-2021"
      },
      {
        title: "Past Research-2",
        description: "Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra.",
        status: "Completed",
        year: "2019-2020"
      },
      {
        title: "Past Research-3",
        description: "Fringilla lacus nec metus bibendum egestas iaculis massa. Taciti sociosqu ad litora torquent per conubia nostra.",
        status: "Completed",
        year: "2018-2019"
      }
    ]
  };

  return (
    <section id="research" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-16"
        >
          {/* Category Tabs */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveCategory('recent')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'recent'
                  ? 'bg-crimson-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Recent Research
            </button>
            <button
              onClick={() => setActiveCategory('past')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === 'past'
                  ? 'bg-crimson-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Past Research
            </button>
          </div>

          {/* Research Projects */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {activeCategory === 'recent' ? 'Recent Research' : 'Past Research'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {researchData[activeCategory].map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      project.status === 'Ongoing' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <p className="text-sm text-gray-500">{project.year}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Research Impact */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Research Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-crimson-600 mb-2">10+</div>
                <p className="text-gray-600">Published Papers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-crimson-600 mb-2">20+</div>
                <p className="text-gray-600">Citations</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-crimson-600 mb-2">30+</div>
                <p className="text-gray-600">Research Collaborations</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Research; 