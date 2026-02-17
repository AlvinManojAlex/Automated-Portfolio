'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl w-full">
          <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-8xl font-light tracking-tight mb-6 text-zinc-900 leading-none">
              Alvin Manoj Alex
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-zinc-500 font-light leading-relaxed max-w-2xl">
              Software developer crafting solutions for real problems
            </p>
          </div>
          
          <div className={`mt-16 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex gap-6 md:gap-8 text-sm tracking-wide">
              <a href="#about" className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300">About</a>
              <a href="#work" className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300">Work</a>
              <a href="#skills" className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300">Skills</a>
              <a href="#contact" className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300">Contact</a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-32 px-6 md:px-12 lg:px-16 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 mb-8 md:mb-12">About</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-base md:text-xl text-zinc-900 font-light leading-relaxed mb-6">
                I’m a software developer focused on building secure, reliable, and scalable applications. I enjoy understanding how systems work end-to-end, from architecture to user experience, and applying that perspective to create thoughtful, user-centered solutions.
              </p>
              <p className="text-base md:text-xl text-zinc-600 font-light leading-relaxed">
                Currently, I work across the full stack with modern web technologies, continuously learning, experimenting with new tools, and building AI/ML-driven solutions that solve meaningful problems. I’m driven by curiosity, craftsmanship, and a desire to contribute to technology through impactful code and collaboration.
              </p>
            </div>
            <div className="flex flex-row md:flex-col gap-8 md:space-y-8">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-2 md:mb-3 pt-8 md:pt-0">Location</h3>
                <p className="text-base md:text-lg text-zinc-900">New York City, NY</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-2 md:mb-3 pt-8 md:pt-0">Experience</h3>
                <p className="text-base md:text-lg text-zinc-900">1 year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work" className="py-16 md:py-32 px-6 md:px-12 bg-white border-t border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 mb-10 md:mb-16">Selected Work</h2>
          <div className="space-y-14 md:space-y-24">
            {[
              {
                title: "Project Alpha",
                description: "A full-stack web application for team collaboration",
                tags: ["React", "Node.js", "PostgreSQL"]
              },
              {
                title: "Project Beta",
                description: "Mobile-first e-commerce platform with real-time analytics",
                tags: ["Next.js", "TypeScript", "Tailwind"]
              },
              {
                title: "Project Gamma",
                description: "AI-powered content management system",
                tags: ["Python", "FastAPI", "OpenAI"]
              }
            ].map((project, index) => (
              <div 
                key={index}
                className="group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-2xl md:text-4xl font-light text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <span className="text-sm text-zinc-400 shrink-0 mt-1 md:mt-2">202{4 - index}</span>
                </div>
                <p className="tetx-base md:text-lg text-zinc-600 font-light leading-relaxed mb-6">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {project.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-xs uppercase tracking-wider text-zinc-400 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-200 bg-stone-50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 md:py-32 px-6 md:px-12 lg:px-16 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 mb-10 md:mb-16">Skills & Technologies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-5 md:mb-8">Frontend</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 font-light">
                <li>React / Next.js</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Three.js</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-5 md:mb-8">Backend</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 font-light">
                <li>Node.js</li>
                <li>Python</li>
                <li>PostgreSQL</li>
                <li>REST APIs</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-5 md:mb-8">Tools</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 font-light">
                <li>Git / GitHub</li>
                <li>Docker</li>
                <li>AWS</li>
                <li>Figma</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-32 px-6 md:px-12 lg:px-16 bg-white border-t border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 mb-10 md:mb-16">Get In Touch</h2>
          <div className="space-y-8 md:space-y-12">
            <p className="text-xl sm:text-2xl md:text-4xl font-light text-zinc-900 leading-relaxed max-w-3xl">
              I'm always interested in hearing about new projects and opportunities.
            </p>
            <div className="flex flex-col md:flex-row gap-5 md:gap-8">
              <a 
                href="mailto:alvinmanoj02@gmail.com" 
                className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300 inline-flex items-center gap-3 group"
              >
                <span className="text-sm text-zinc-400">Email</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
              <a 
                href="https://github.com/AlvinManojAlex" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300 inline-flex items-center gap-3 group"
              >
                <span className="text-sm text-zinc-400">GitHub</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/alvin-manoj-alex/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 hover:text-zinc-600 transition-colors duration-300 inline-flex items-center gap-3 group"
              >
                <span className="text-sm text-zinc-400">LinkedIn</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12 lg:px-16 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-zinc-400">
            © 2026 Alvin Manoj Alex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}