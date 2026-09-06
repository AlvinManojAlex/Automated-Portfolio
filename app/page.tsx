'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface Project {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  created_at: string;
  topics: string[];
  language: string | null;
}

// function to modify the project name and keep it user-friendly to read
function formatProjectName(name: string): string {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// topics used by fewer than this many projects are hidden by default in the dropdown
const TOPIC_VISIBILITY_THRESHOLD = 2;

// months of experience before full-time work started, plus the full-time start date
const PRIOR_EXPERIENCE_MONTHS = 8;
const FULL_TIME_START = new Date(2026, 6, 1); // July 2026

function getExperienceLabel(): string {
  const now = new Date();
  const monthsElapsed =
    (now.getFullYear() - FULL_TIME_START.getFullYear()) * 12 +
    (now.getMonth() - FULL_TIME_START.getMonth());
  const totalMonths = PRIOR_EXPERIENCE_MONTHS + monthsElapsed;

  if (totalMonths >= 12) {
    const years = Math.floor(totalMonths / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
}

// sections linked from both the hero row and the sticky navbar
const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

function ThemeToggle({ darkMode, onToggle, className = '' }: { darkMode: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className={`w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors duration-300 ${className}`}
    >
      {darkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [topicQuery, setTopicQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // the section shown in the tab panel below the navbar
  const [activeSection, setActiveSection] = useState(NAV_LINKS[0].id);
  // navbar on screen => the hero's own link row and floating theme toggle step aside
  const [showNav, setShowNav] = useState(false);
  // after the first scroll the hero links swap on the slow entrance timing for a quick fade
  const [navSeen, setNavSeen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);

  // useState variables for checking overflow of project description
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [isOverflowing, setIsOverflowing] = useState<Record<number, boolean>>({});
  const descRefs = useRef<Record<number, HTMLParagraphElement | null>>({});

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    // Fetch projects from public/projects.json
    fetch('/projects.json')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching projects: ", error);
        setLoading(false);
      });
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  function toggleTopic(topic: string) {
    setActiveTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  }

  const topicCounts = new Map<string, number>();
  projects.forEach(p => {
    (p.topics || []).forEach(t => {
      if (t === 'featured') return;
      topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
    });
  });

  const allTopics = Array.from(topicCounts.keys()).sort((a, b) => {
    const diff = (topicCounts.get(b) ?? 0) - (topicCounts.get(a) ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  const frequentTopics = allTopics.filter(
    t => (topicCounts.get(t) ?? 0) >= TOPIC_VISIBILITY_THRESHOLD
  );

  const visibleProjects = activeTopics.length === 0
    ? projects.filter(p => p.topics?.includes('featured'))
    : projects.filter(p => p.topics?.some(t => activeTopics.includes(t)));

  const trimmedQuery = topicQuery.trim().toLowerCase();

  // active search always spans every topic, ignoring the visibility threshold
  const topicsToSearch = trimmedQuery || showAllTopics ? allTopics : frequentTopics;

  const filteredTopics = topicsToSearch.filter(
    t => !activeTopics.includes(t) && t.toLowerCase().includes(trimmedQuery)
  );

  // rare topics currently hidden from the default list (excludes already-active chips)
  const hiddenRareTopicsCount = allTopics.filter(
    t => !activeTopics.includes(t) && (topicCounts.get(t) ?? 0) < TOPIC_VISIBILITY_THRESHOLD
  ).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // the navbar duplicates the hero's links, so hide those as soon as it scrolls into view
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowNav(entry.isIntersecting);
        if (entry.isIntersecting) setNavSeen(true);
      },
      // the navbar starts flush with the bottom of the viewport, so require a real
      // sliver of it on screen before treating it as visible
      { threshold: 0, rootMargin: '0px 0px -96px 0px' }
    );
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  // open the section named in the URL hash, on load and on back/forward
  useEffect(() => {
    function applyHash() {
      const id = window.location.hash.slice(1);
      if (!NAV_LINKS.some(link => link.id === id)) return;
      pendingScrollRef.current = true;
      setActiveSection(id);
    }

    applyHash();
    window.addEventListener('hashchange', applyHash);
    window.addEventListener('popstate', applyHash);
    return () => {
      window.removeEventListener('hashchange', applyHash);
      window.removeEventListener('popstate', applyHash);
    };
  }, []);

  // once the newly selected section has rendered, bring the navbar to the top of the viewport
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    scrollToTabs();
  }, [activeSection]);

  function scrollToTabs() {
    const tabs = tabsRef.current;
    if (tabs) window.scrollTo({ top: tabs.offsetTop, behavior: 'smooth' });
  }

  // nav + hero links pick a section instead of scrolling to it
  function selectSection(e: React.MouseEvent, id: string) {
    e.preventDefault();

    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`);
    }

    if (id === activeSection) {
      scrollToTabs(); // already open - just bring it into view
      return;
    }

    pendingScrollRef.current = true;
    setActiveSection(id);
  }

  useEffect(() => {
    const newOverflow: Record<number, boolean> = {};

    Object.keys(descRefs.current).forEach((key) => {
      const el = descRefs.current[Number(key)];

      if (el) {
        // temporarily force clamp ON for measurement
        const wasExpanded = expanded[Number(key)];

        if (wasExpanded) {
          el.classList.add('line-clamp-5');
        }

        newOverflow[Number(key)] = el.scrollHeight > el.clientHeight;

        if (wasExpanded) {
          el.classList.remove('line-clamp-5');
        }
      }
    });

    setIsOverflowing(newOverflow);
    // hidden tab panels measure as zero-height, so re-measure whenever Work is reopened
  }, [projects, activeSection]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Dark mode toggle - floats over the hero, fades out once the navbar takes over */}
      <div className={`fixed top-5 right-5 z-50 transition-opacity duration-300 ${showNav ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} className="shadow-sm" />
      </div>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl w-full">
          <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12">
              {/* Profile picture - shows first on mobile, last on desktop */}
              <div className="shrink-0 order-first md:order-last mx-auto md:mx-0">
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                  <Image
                    src="/profile.jpeg"
                    alt="Alvin Manoj Alex"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
              
              {/* Text content */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-8xl font-light tracking-tight mb-6 text-zinc-900 dark:text-zinc-50 leading-none">
                  Alvin Manoj Alex
                </h1>
                <p className="text-base sm:text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
                  Software developer crafting solutions for real problems
                </p>
              </div>
            </div>
          </div>
          
          {/* hero links fade out once the navbar - which carries the same links - is on screen */}
          <div
            aria-hidden={showNav}
            className={`mt-16 transition-all ${navSeen ? 'duration-300' : 'duration-1000 delay-300'} ${
              mounted && !showNav ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <div className="flex gap-6 md:gap-8 text-sm tracking-wide justify-center md:justify-start">
              {NAV_LINKS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => selectSection(e, id)}
                  className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section switcher - the navbar pins to the top and swaps the panel below it */}
      <div ref={tabsRef}>
        <nav
          ref={navRef}
          aria-label="Primary"
          className="sticky top-0 z-40 border-y border-zinc-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/80 backdrop-blur-md"
        >
          {/* padding outside the max-width, same as the section panels, so the row lines up with their content */}
          <div className="px-6 md:px-12 lg:px-16">
            <div className="max-w-5xl mx-auto h-14 md:h-16 flex items-center gap-4">
              {/* name is dropped below sm - the links get the room instead */}
              <a
                href="#home"
                className="hidden sm:inline shrink-0 text-sm md:text-base font-light tracking-tight text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300"
              >
                Alvin Manoj Alex
              </a>
              <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
                {/* left-aligned below md so an overflowing row scrolls right instead of spilling off the left edge */}
                <div className="flex justify-start md:justify-end gap-4 md:gap-8 text-xs md:text-sm tracking-wide whitespace-nowrap">
                  {NAV_LINKS.map(({ id, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => selectSection(e, id)}
                      aria-current={activeSection === id ? 'page' : undefined}
                      className={`shrink-0 pb-0.5 border-b transition-colors duration-300 ${
                        activeSection === id
                          ? 'text-zinc-900 dark:text-zinc-100 border-current'
                          : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
              <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} className="shrink-0 ml-1 md:ml-6" />
            </div>
          </div>
        </nav>

        {/* Only the selected section is displayed; the rest stay mounted but hidden */}
        <div className="min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">

      {/* About Section */}
      <section id="about" hidden={activeSection !== 'about'} className="section-panel py-16 md:py-32 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-8 md:mb-12">About</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-base md:text-xl text-zinc-900 dark:text-zinc-100 font-light leading-relaxed mb-6">
                I’m a software developer focused on building secure, reliable, and scalable applications. I enjoy understanding how systems work end-to-end, from architecture to user experience, and applying that perspective to create thoughtful, user-centered solutions.
              </p>
              <p className="text-base md:text-xl text-zinc-900 dark:text-zinc-100 font-light leading-relaxed">
                Currently, I work across the full stack with modern web technologies, continuously learning and experimenting with new tools that solve meaningful problems. I’m driven by curiosity and a desire to contribute to technology through impactful code and collaboration.
              </p>
            </div>
            <div className="flex flex-row md:flex-col gap-8 md:space-y-8">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 md:mb-3 pt-8 md:pt-0">Location</h3>
                <p className="text-base md:text-lg text-zinc-900 dark:text-zinc-100">New York City, NY</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 md:mb-3 pt-8 md:pt-0">Experience</h3>
                <p className="text-base md:text-lg text-zinc-900 dark:text-zinc-100">{getExperienceLabel()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work" hidden={activeSection !== 'work'} className="section-panel py-16 md:py-32 px-6 md:px-12 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-10 md:mb-16">Selected Work</h2>

          {!loading && allTopics.length > 0 && (
            <div ref={comboRef} className="relative mb-10 md:mb-16">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                <button
                  onClick={() => setActiveTopics([])}
                  className={`rounded-full text-xs uppercase tracking-wider px-3 py-1.5 md:px-4 md:py-2 border transition-colors duration-300 ${
                    activeTopics.length === 0
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  Featured
                </button>
                {activeTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className="rounded-full text-xs uppercase tracking-wider px-3 py-1.5 md:px-4 md:py-2 border border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 transition-colors duration-300 inline-flex items-center gap-2"
                  >
                    {topic}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={topicQuery}
                  onChange={e => {
                    setTopicQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search topics..."
                  className="w-full rounded-full text-sm pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                />
              </div>

              {dropdownOpen && (filteredTopics.length > 0 || (!trimmedQuery && hiddenRareTopicsCount > 0)) && (
                <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                  {filteredTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => {
                        toggleTopic(topic);
                        setTopicQuery('');
                        setDropdownOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 w-full text-left text-xs uppercase tracking-wider px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>{topic}</span>
                      <span className="text-zinc-400 dark:text-zinc-500 normal-case tracking-normal">
                        {topicCounts.get(topic) ?? 0}
                      </span>
                    </button>
                  ))}

                  {!trimmedQuery && hiddenRareTopicsCount > 0 && (
                    <button
                      onClick={() => setShowAllTopics(prev => !prev)}
                      className="sticky bottom-0 block w-full text-center text-xs uppercase tracking-wider px-4 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showAllTopics ? 'Show fewer topics' : `Show all topics (+${hiddenRareTopicsCount})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center text-zinc-400 dark:text-zinc-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center text-zinc-400 dark:text-zinc-500">No projects found</div>
          ) : visibleProjects.length === 0 ? (
            <div className="text-center text-zinc-400 dark:text-zinc-500">No projects match the selected filters</div>
          ) : (
            <div className="space-y-14 md:space-y-24">
              {visibleProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors duration-300 mb-2">
                        {formatProjectName(project.name)}
                      </h3>
                      <a
                        href={project.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
                      >
                        View on GitHub →
                      </a>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {new Date(project.created_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                  <p
                    ref={(el) => {
                      descRefs.current[index] = el;
                    }}
                    className={`text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed ${
                      expanded[index] ? '' : 'line-clamp-5'
                    }`}
                  >
                    {project.description || 'No description provided'}
                  </p>
                  {project.description && isOverflowing[index] && (
                    <button
                      onClick = {() =>
                        setExpanded(prev => ({
                          ...prev,
                          [index]: !prev[index]
                        }))
                      }
                      className="mb-3 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {expanded[index] ? "View less" : "View more"}
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2 md:gap-3 md:mt-3 mt-3">
                    {project.topics && project.topics.length > 0 ? (
                      project.topics
                        .filter(topic => topic !== 'featured')
                        .map((topic, i) => (
                          <span
                            key={i}
                            className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800"
                          >
                            {topic}
                          </span>
                        ))
                    ) : project.language ? (
                      <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800">
                        {project.language}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" hidden={activeSection !== 'skills'} className="section-panel py-16 md:py-32 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-10 md:mb-16">Skills & Technologies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">Languages</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>Python</li>
                <li>Java</li>
                <li>C / C++</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">Frontend</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>React / Next.js</li>
                <li>React Native</li>
                <li>Node.js</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">Backend & Data</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>REST APIs</li>
                <li>Data Pipelines</li>
                <li>Apache Spark</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">Databases</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>MySQL</li>
                <li>MongoDB</li>
                <li>Data Management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">AI & ML</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>Machine Learning</li>
                <li>Deep Learning</li>
                <li>PyTorch</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">DevOps & Tools</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>Git / GitHub</li>
                <li>Docker</li>
                <li>AWS</li>
              </ul>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5 md:mb-8">Methodologies</h3>
              <ul className="space-y-3 md:space-y-4 text-base text-zinc-900 dark:text-zinc-100 font-light">
                <li>OOP & Design Patterns</li>
                <li>Agile / Scrum</li>
                <li>A/B Testing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Experience section */}
      <section id="experience" hidden={activeSection !== 'experience'} className="section-panel py-16 md:py-32 px-6 md:px-12 lg:px-16 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-10 md:mb-16">Experience</h2>
          <div className="space-y-14 md:space-y-24">
                {[
                  {
                    company: "FinDi Ltd.",
                    role: "Software Engineer",
                    period: "Jul 2026 - Present",
                    description: [
                      "Built and configured Firebase cloud infrastructure to support QA testing and development workflows, providing a dedicated environment for application validation.",
                      "Developed a backend feature integrating the Plaid API to retrieve up to two years of user transaction history, calculate historical averages and baseline metrics, and persist results in Firestore for frontend consumption.",
                      "Diagnosed and fixed a backend issue causing timeouts during Plaid API user-data extraction, improving reliability of a critical external API integration.",
                      "Redesigned and repaired a failing CI/CD deployment pipeline responsible for automatically deploying backend functions to Firebase, restoring reliable automated deployments.",
                      "Investigated and resolved a backend logging failure caused by cyclic logger calls, eliminating recursive stack overflows and restoring application logging functionality."
                    ]
                  },
                  {
                    company: "MABANEE",
                    role: "Software Engineer Intern",
                    period: "Dec 2025 - Jan 2026",
                    description: [
                      "Diagnosed and fixed production bugs in an internal workforce attendance system, including resolving ISO year date format causing SQL data inconsistencies.",
                      "Identified and fixed improper HTTP request types sent to an Oracle Fusion servlet through targeted testing and log analysis, restoring correct backend communication and application functionality."
                    ]
                  },
                  {
                    company: "Signal Corporation",
                    role: "Software Engineer Intern",
                    period: "Jun 2023 - Aug 2023",
                    description: [
                      "Developed and enhanced a location-based Named Entity Recognition (NER) system by integrating transfer learning, optimizing model architecture, and extending the existing Stanford NER pipeline to improve accuracy. ",
                      "Engineered and evaluated multiple ML/NLP models by benchmarking CRF, and state-of-the-art transformer architectures for NER tasks, resulting in a 2% increase in precision and recall."
                    ]
                  },
                  {
                    company: "IEEE",
                    role: "Research Intern",
                    period: "Jun 2023 - Aug 2023",
                    description: [
                      "Engineered and enhanced deep learning models for target classification on the MSTAR SAR dataset, fine-tuning ResNet, VGG, and custom CNN architectures.",
                      "Built end-to-end ML workflows, including dataset preprocessing, feature extraction, model training, hyperparameter tuning, and deployment-ready inference modules using Python, PyTorch, and NumPy."
                    ]
                  }
                ].map((job, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-4xl font-light text-zinc-900 dark:text-zinc-50 mb-2">
                          {job.company}
                        </h3>
                        <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-light">
                          {job.role}
                        </p>
                      </div>
                      <span className="text-sm text-zinc-400 dark:text-zinc-500 shrink-0 mt-1 md:mt-2">
                        {job.period}
                      </span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {job.description.map((point, i) => (
                        <li key={i} className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed flex gap-3">
                          <span className="text-zinc-400 dark:text-zinc-500 shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" hidden={activeSection !== 'contact'} className="section-panel py-16 md:py-32 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-10 md:mb-16">Get In Touch</h2>
          <div className="space-y-8 md:space-y-12">
            <p className="text-xl sm:text-2xl md:text-4xl font-light text-zinc-900 dark:text-zinc-100 leading-relaxed max-w-3xl">
              I'm always interested in hearing about new projects and opportunities.
            </p>
            <div className="flex flex-col md:flex-row gap-5 md:gap-8">
              <a
                href="mailto:alvinmanoj02@gmail.com"
                className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300 inline-flex items-center gap-3 group"
              >
                <span className="text-sm text-zinc-400 dark:text-zinc-500">Email</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
              <a
                href="https://github.com/AlvinManojAlex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300 inline-flex items-center gap-3 group"
              >
                <span className="text-sm text-zinc-400 dark:text-zinc-500">GitHub</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
              <a
                href="https://www.linkedin.com/in/alvin-manoj-alex/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300 inline-flex items-center gap-3 group"
              >
                <span className="text-sm text-zinc-400 dark:text-zinc-500">LinkedIn</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12 lg:px-16 border-t bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            © 2026 Alvin Manoj Alex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}