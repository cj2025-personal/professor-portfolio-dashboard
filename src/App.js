import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Blogs from './components/Blogs';
import Research from './components/Research';
import Publications from './components/Publications';
import OngoingResearch from './components/OngoingResearch';
import Teaching from './components/Teaching';
import Contact from './components/Contact';
import CoursePresentations from './components/CoursePresentations';
import CourseLectures from './components/CourseLectures';
import CourseModules from './components/CourseModules';
import ModulePresentations from './components/ModulePresentations';
import ModuleLectures from './components/ModuleLectures';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <About />
                <Blogs />
                <OngoingResearch />
                <Publications />
                <Teaching />
                <Contact />
              </>
            } />
            <Route path="/course/:courseId/presentations" element={<CoursePresentations />} />
            <Route path="/course/:courseId/lectures" element={<CourseLectures />} />
            <Route path="/course/:courseId/modules" element={<CourseModules />} />
            <Route path="/module/:moduleId/presentations" element={<ModulePresentations />} />
            <Route path="/module/:moduleId/lectures" element={<ModuleLectures />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
