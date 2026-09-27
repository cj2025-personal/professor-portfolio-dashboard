import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortfolioMetadata from './components/PortfolioMetadata';
import Hero from './components/Hero';
import PortfolioPlatform from './components/PortfolioPlatform';
import ArchivynPage from './components/ArchivynPage';
import About from './components/About';
import Blogs from './components/Blogs';
import Publications from './components/Publications';
import OngoingResearch from './components/OngoingResearch';
import Teaching from './components/Teaching';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CoursePresentations from './components/CoursePresentations';
import CourseLectures from './components/CourseLectures';
import CourseModules from './components/CourseModules';
import ModulePresentations from './components/ModulePresentations';
import ModuleLectures from './components/ModuleLectures';
import DiscussionTopics from './components/DiscussionTopics';
import DiscussionComments from './components/DiscussionComments';
import Chatbot from './components/Chatbot';
import ScrollToHash from './components/ScrollToHash';
import './App.css';
import './portfolio.css';

function App() {
  return (
    <Router>
      <PortfolioMetadata />
      <div className="min-h-screen bg-white">
        <ScrollToHash />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <PortfolioPlatform />
                <About />
                <Blogs />
                <OngoingResearch />
                <Publications />
                <Teaching />
                <Contact />
                <Footer />
              </>
            } />
            <Route path="/standards" element={<Navigate to="/proj-arch" replace />} />
            <Route path="/proj-arch" element={<ArchivynPage />} />
            <Route path="/archivyn" element={<Navigate to="/proj-arch" replace />} />
            <Route path="/course/:courseId/presentations" element={<CoursePresentations />} />
            <Route path="/course/:courseId/lectures" element={<CourseLectures />} />
            <Route path="/course/:courseId/modules" element={<CourseModules />} />
            <Route path="/course/:courseId/discussions" element={<DiscussionTopics />} />
            <Route path="/course/:courseId/discussions/:topicId" element={<DiscussionComments />} />
            <Route path="/module/:moduleId/presentations" element={<ModulePresentations />} />
            <Route path="/module/:moduleId/lectures" element={<ModuleLectures />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
