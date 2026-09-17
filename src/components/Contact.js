import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useScholar } from '../lib/useScholar';

const Contact = () => {
  const { scholar } = useScholar();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus(''), 3000);
      } else {
        setSubmitStatus(data.message || 'error');
      }
    } catch (error) {
      setSubmitStatus('An error occurred while sending your message. Please try again.');
    }
  };

  const details = [
    {
      label: 'Office',
      value: (
        <>
          {scholar.department}
          <br />
          1315 E. 10th Street
          <br />
          Bloomington, IN 47405
        </>
      ),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      value: (
        <a href="mailto:crljohns@iu.edu" className="font-medium text-brand-600 hover:text-brand-700">
          crljohns@iu.edu
        </a>
      ),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Telephone',
      value: <a href="tel:+18128550742" className="hover:text-brand-600">812-855-0742</a>,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="contact" className="ark-band ark-section">
      <div className="ark-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2"
        >
          {/* Contact Information */}
          <div>
            <div className="sec-head">
              <p className="sec-eyebrow">Get in touch</p>
              <h2 className="sec-title">Contact</h2>
              <p className="sec-lead">
                Questions about the research, the courses, or a possible
                collaboration are all welcome.
              </p>
            </div>

            {/* One hairline register rather than three separate floating
                cards — the details are a single block of information. */}
            <dl className="ark-card ark-list overflow-hidden">
              {details.map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-5">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <dt className="ark-kicker">{item.label}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Contact Form */}
          <div className="ark-card p-5 md:p-6">
            <h3 className="type-subheading text-gray-900">Send a message</h3>
            <p className="ark-meta mt-1.5">All fields are required.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="ark-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="ark-field"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="ark-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="ark-field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="ark-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="ark-field"
                />
              </div>

              <div>
                <label htmlFor="message" className="ark-label">Message</label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="ark-field"
                />
              </div>

              <div>
                <button type="submit" className="btn-primary btn-lg w-full">
                  Send message
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {submitStatus === 'success' && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Message sent successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {submitStatus && submitStatus !== 'success' && (
                <div className="rounded-md bg-red-50 p-4 mt-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 01-2 0zm1 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {submitStatus}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact; 
