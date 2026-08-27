const { useState, useEffect, useRef, useCallback } = React;

// ========== 默认值 ==========
const DEFAULT_LOGO_URL = "https://aka.doubaocdn.com/s/bh4rMtFLu2";
const DEFAULT_AVATAR_URL = "assets/avatar/avatar.gif";
const DEFAULT_COMMISSION_STATUS = "open";

// ========== 语言切换 ==========
function useLanguage() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("portfolio-lang");
    return saved || "zh-TW";
  });
  useEffect(() => { localStorage.setItem("portfolio-lang", lang); document.documentElement.lang = lang; }, [lang]);
  return { lang, setLang };
}

// ========== 多语言文本辅助函数 ==========
function getText(field, lang, fallback) {
  if (!field) return fallback || "";
  if (typeof field === "string") return field;
  return field[lang] || field["zh-TW"] || field["en"] || fallback || "";
}

// ========== React Bits: WarpText ==========
// SVG displacement keeps the effect reliable in this no-build static site.
function WarpText({
  text = "Bend the moment", color = "#f8f5ff", warpStrength = 0.08,
  warpScale = 1.7, speed = 0.55, pointerInfluence = 0.42,
  pointerStrength = 0.38, refraction = 0.018, ripple = true,
  tag = "div", className = "", style
}) {
  const rootRef = useRef(null);
  const filterId = useRef("warp-text-" + Math.random().toString(36).slice(2));
  const Tag = tag;
  const distortion = Math.max(3, Math.round(warpStrength * 220));
  const lensSize = Math.round(90 + pointerInfluence * 160);
  const duration = Math.max(4, Math.round(14 / Math.max(speed, 0.1)));

  const movePointer = (event) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const root = rootRef.current;
    root.style.setProperty("--warp-x", (x * 100) + "%");
    root.style.setProperty("--warp-y", (y * 100) + "%");
    root.style.setProperty("--warp-shift-x", ((x - 0.5) * pointerStrength * 8) + "px");
    root.style.setProperty("--warp-shift-y", ((y - 0.5) * pointerStrength * 8) + "px");
    root.style.setProperty("--warp-lens-opacity", "1");
  };

  return (
    <Tag
      ref={rootRef}
      className={("warp-text " + className).trim()}
      style={{ ...style, "--warp-color": color, "--warp-lens-size": lensSize + "px" }}
      onPointerMove={movePointer}
      onPointerLeave={() => rootRef.current?.style.setProperty("--warp-lens-opacity", "0")}
      aria-label={text}
    >
      <svg className="warp-text-defs" aria-hidden="true" focusable="false">
        <filter id={filterId.current} x="-12%" y="-35%" width="124%" height="170%">
          <feTurbulence type="fractalNoise" baseFrequency={(0.006 * warpScale) + " " + (0.03 * warpScale)} numOctaves="2" seed="8" result="noise">
            <animate attributeName="baseFrequency" values={(0.005 * warpScale) + " " + (0.025 * warpScale) + ";" + (0.012 * warpScale) + " " + (0.042 * warpScale) + ";" + (0.005 * warpScale) + " " + (0.025 * warpScale)} dur={duration + "s"} repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={distortion} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <span className="warp-text-content" style={{ filter: "url(#" + filterId.current + ")" }} data-text={text}>{text}</span>
      {ripple && <span className="warp-text-lens" aria-hidden="true" style={{ "--warp-refraction": refraction }} />}
    </Tag>
  );
}

function SpecularButton({ children, className = "", active = false, onClick, href, type = "button" }) {
  const ref = useRef(null);
  const Tag = href ? "a" : "button";

  const handlePointerMove = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    ref.current.style.setProperty("--specular-x", ((event.clientX - rect.left) / rect.width * 100) + "%");
    ref.current.style.setProperty("--specular-y", ((event.clientY - rect.top) / rect.height * 100) + "%");
    ref.current.style.setProperty("--specular-opacity", "1");
  };

  const handlePointerLeave = () => {
    ref.current?.style.setProperty("--specular-opacity", "0");
  };

  const props = {
    ref,
    className: "specular-button " + (active ? "is-active " : "") + className,
    onClick,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  };
  if (href) props.href = href;
  else props.type = type;

  return <Tag {...props}>{children}</Tag>;
}

function ClickSpark({ children }) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    let animationFrame;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const progress = (now - spark.start) / 520;
        if (progress >= 1) return false;
        const alpha = 1 - progress;
        const distance = 54 * (1 - Math.pow(1 - progress, 3));
        context.strokeStyle = "rgba(255, 198, 237, " + alpha + ")";
        context.lineWidth = 1.5;
        spark.angles.forEach((angle) => {
          const start = distance;
          const end = distance + 15 * alpha;
          context.beginPath();
          context.moveTo(spark.x + Math.cos(angle) * start, spark.y + Math.sin(angle) * start);
          context.lineTo(spark.x + Math.cos(angle) * end, spark.y + Math.sin(angle) * end);
          context.stroke();
        });
        return true;
      });
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const addSpark = (event) => {
    const angles = Array.from({ length: 10 }, (_, index) => (Math.PI * 2 * index) / 10);
    sparksRef.current.push({ x: event.clientX, y: event.clientY, start: performance.now(), angles });
  };

  return (
    <div className="click-spark-host" onClick={addSpark}>
      <canvas className="click-spark-canvas" ref={canvasRef} aria-hidden="true" />
      {children}
    </div>
  );
}

function safeMediaUrl(value) {
  const url = (value || "").trim();
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("./") || url.startsWith("assets/")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : "";
  } catch {
    return "";
  }
}

function getEmbedUrl(url) {
  const safeUrl = safeMediaUrl(url);
  if (!safeUrl || safeUrl.startsWith("/") || safeUrl.startsWith(".")) return "";
  try {
    const parsed = new URL(safeUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(parsed.pathname.slice(1)) + "?rel=0";
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const videoId = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
      return videoId ? "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?rel=0" : "";
    }
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      return videoId ? "https://player.vimeo.com/video/" + encodeURIComponent(videoId) : "";
    }
  } catch {
    return "";
  }
  return "";
}

function workMediaUrl(work) {
  return safeMediaUrl(work?.media_url || work?.video || "");
}

function workSourceUrl(work) {
  return safeMediaUrl(work?.source_url || workMediaUrl(work));
}

function workCoverUrl(work) {
  return safeMediaUrl(work?.cover_image || work?.cover || work?.image || "");
}

function PortfolioMedia({ work }) {
  const [failed, setFailed] = useState(false);
  const mediaType = work?.media_type || (work?.video ? "video" : "image");
  const url = workMediaUrl(work);
  const embedUrl = mediaType === "video" ? getEmbedUrl(url) : "";

  if (mediaType === "image") {
    const imageUrl = safeMediaUrl(work?.media_url || work?.cover_image || work?.image || "");
    return imageUrl ? <img src={imageUrl} alt={work?.title || ""} /> : <div className="media-unavailable">尚未加入作品图片</div>;
  }
  if (embedUrl) {
    return <iframe src={embedUrl} title={work?.title || "Portfolio video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  }
  if (url && !failed) {
    return <video src={url} controls playsInline preload="metadata" onError={() => setFailed(true)} />;
  }
  return (
    <a className="media-external-link" href={url || "#"} target="_blank" rel="noopener noreferrer">
      在原始平台观看作品 ↗
    </a>
  );
}

// ========== 滚动动画 Hook ==========
function useScrollReveal(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".reveal, .reveal-scale").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);
}

// ========== 导航栏 ==========
function Navbar({ lang, setLang, siteContent, commissionStatus, settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    const onClick = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("click", onClick); };
  }, []);

  const nav = siteContent?.nav || {};
  const navItems = [
    { href: "#about", label: getText(nav.about, lang, "About") },
    { href: "#services", label: getText(nav.services, lang, "Services") },
    { href: "#portfolio", label: getText(nav.portfolio, lang, "Works") },
    { href: "#process", label: getText(nav.process, lang, "Process") },
    { href: "#pricing", label: getText(nav.pricing, lang, "Pricing") },
    { href: "#contact", label: getText(nav.contact, lang, "Contact") },
  ];

  const languages = [
    { code: "zh-TW", label: "繁體中文" },
    { code: "zh-CN", label: "简体中文" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "es", label: "Español" },
  ];

  const statusClass = commissionStatus === "open" ? "status-open" : commissionStatus === "full" ? "status-full" : "status-paused";
  const statusText = getText(siteContent?.commission?.status?.[commissionStatus], lang, commissionStatus);
  const siteName = settings?.site_name || siteContent?.site?.name || "9th Studio";

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#hero" className="nav-logo" onClick={() => setMobileOpen(false)}>
            <span>{siteName}</span>
          </a>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.href}><a href={item.href}>{item.label}</a></li>
            ))}
          </ul>
          <div className="nav-actions">
            <div className={`commission-status ${statusClass}`}>
              <span className="status-dot"></span>
              <span>{statusText}</span>
            </div>
            <div className="lang-switcher" ref={langRef}>
              <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
                <svg className="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                {languages.find(l => l.code === lang)?.label?.slice(0, 2) || "EN"}
              </button>
              <div className={`lang-dropdown ${langOpen ? "open" : ""}`}>
                {languages.map((l) => (
                  <button key={l.code} className={`lang-option ${lang === l.code ? "active" : ""}`} onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="mobile-menu open">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}><a href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a></li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ========== Hero ==========
function Hero({ lang, siteContent, commissionStatus, avatarUrl, settings }) {
  const hero = siteContent?.hero || {};
  const statusClass = commissionStatus === "open" ? "status-open" : commissionStatus === "full" ? "status-full" : "status-paused";
  const badgeText = getText(siteContent?.commission?.badge?.[commissionStatus], lang, "");
  const ownerName = settings?.display_name || siteContent?.site?.owner_name || "Kyuu";
  const greeting = settings?.hero_greeting || getText(hero.greeting, lang, "HELLO");
  const subtitle = settings?.hero_subtitle || getText(hero.subtitle, lang, "");
  const tagline = settings?.hero_tagline || getText(hero.tagline, lang, "");

  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <div className={`commission-badge ${statusClass}`}>
            <span className="status-dot"></span>
            <span>{badgeText}</span>
          </div>
          <div className="hero-greeting">{greeting}</div>
          <WarpText tag="h1" className="hero-name" text={ownerName} color="#f7f5ff" warpStrength={0.09} warpScale={1.55} speed={0.48} pointerStrength={0.46} />
          <div className="hero-subtitle">{subtitle}</div>
          <div className="hero-title">
            <span>Live 2D 建模师</span><span className="dot"></span>
            <span>VTuber Modeler</span><span className="dot"></span>
            <span>Illustrator</span>
          </div>
          <p className="hero-tagline">{tagline}</p>
          <div className="hero-cta">
            <SpecularButton href="#portfolio" className="btn btn-primary">{getText(hero.cta_works, lang, "View Works")} →</SpecularButton>
            <SpecularButton href="#contact" className="btn btn-secondary">{getText(hero.cta_contact, lang, "Contact")}</SpecularButton>
          </div>
        </div>
        <div className="hero-visual">
          <div className="avatar-wrapper">
            <div className="avatar-glow"></div>
            <div className="avatar-ring"></div>
            <div className="avatar-img"><img src={avatarUrl} alt="avatar" /></div>
            <div className="avatar-badge badge-1"><span className="dot"></span>9th Studio</div>
            <div className="avatar-badge badge-2"><span className="dot"></span>@kyu_506</div>
            <div className="avatar-badge badge-3"><span className="dot"></span>Since 2023</div>
          </div>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="mouse"></div>
        <span>Scroll</span>
      </div>
    </section>
  );
}

// ========== About ==========
function About({ lang, siteContent, avatarUrl, settings }) {
  const about = siteContent?.about || {};
  const statsLabels = siteContent?.about_stats_labels || {};
  const stats = about.stats || [
    { value: "10+", label_key: "models" },
    { value: "2", label_key: "collaborators" },
    { value: "2023", label_key: "since" },
    { value: "6", label_key: "services" },
  ];
  const skills = about.skills || [];

  return (
    <section id="about" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(about.eyebrow, lang, "ABOUT ME")}</div>
          <WarpText tag="h2" className="section-title" text={settings?.about_title || getText(about.title, lang, "About Me")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
          <p className="section-subtitle">{settings?.about_subtitle || getText(about.subtitle, lang, "")}</p>
        </div>
        <div className="about-grid">
          <div className="about-image reveal">
            <img src={avatarUrl} alt="About" />
          </div>
          <div className="about-content">
            <p className="about-text reveal reveal-delay-1">{settings?.about_text_1 || getText(about.text1, lang, "")}</p>
            <p className="about-text reveal reveal-delay-2">{settings?.about_text_2 || getText(about.text2, lang, "")}</p>
            <div className="about-stats reveal reveal-delay-3">
              {stats.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{getText(statsLabels[s.label_key], lang, s.label_key)}</div>
                </div>
              ))}
            </div>
            <div className="reveal reveal-delay-4">
              <h3 className="about-skills-title">{getText(about.skills_title, lang, "Skills")}</h3>
              <div className="skills-grid">
                {skills.map((skill, i) => (<span className="skill-tag" key={i}>{skill}</span>))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== Services ==========
function Services({ lang, siteContent }) {
  const labels = siteContent?.section_labels?.services || {};
  const services = siteContent?.services || [];
  return (
    <section id="services" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(labels.eyebrow, lang, "SERVICES")}</div>
          <WarpText tag="h2" className="section-title" text={getText(labels.title, lang, "Services")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
          <p className="section-subtitle">{getText(labels.subtitle, lang, "")}</p>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card reveal reveal-delay-1" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="service-icon"><span style={{ fontSize: "28px" }}>{s.icon || "✨"}</span></div>
              <h3 className="service-title">{getText(s.title, lang, "")}</h3>
              <p className="service-desc">{getText(s.desc, lang, "")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== Portfolio ==========
function Portfolio({ lang, siteContent, worksData }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const labels = siteContent?.section_labels?.portfolio || {};
  const filterLabels = siteContent?.portfolio_filter || {};
  const catLabels = siteContent?.portfolio_categories || {};

  const categories = [
    { id: "all", label: getText(filterLabels.all, lang, "All") },
    { id: "vtuber", label: getText(filterLabels.vtuber, lang, "VTuber") },
    { id: "live2d", label: getText(filterLabels.live2d, lang, "Live2D") },
    { id: "character", label: getText(filterLabels.character, lang, "Character") },
    { id: "illustration", label: getText(filterLabels.illustration, lang, "Illustration") },
    { id: "vts", label: getText(filterLabels.vts, lang, "VTS") },
    { id: "emoji", label: getText(filterLabels.emoji, lang, "Emoji") },
  ];

  const filtered = filter === "all" ? worksData : worksData.filter((w) => w.category === filter);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  useEffect(() => {
    if (selected) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <section id="portfolio" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(labels.eyebrow, lang, "PORTFOLIO")}</div>
          <WarpText tag="h2" className="section-title" text={getText(labels.title, lang, "Portfolio")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
          <p className="section-subtitle">{getText(labels.subtitle, lang, "")}</p>
        </div>
        <div className="filter-bar reveal">
          {categories.map((c) => (
            <SpecularButton key={c.id} className="filter-btn" active={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</SpecularButton>
          ))}
        </div>
        {filtered.length > 0 ? (
          <div className="accordion-gallery" role="list" aria-label={getText(labels.title, lang, "Portfolio")}>
            {filtered.map((work, index) => {
              const isActive = index === Math.min(activeIndex, filtered.length - 1);
              const coverUrl = workCoverUrl(work);
              return (
                <button
                  className={"accordion-panel " + (isActive ? "is-active" : "")}
                  key={work.id || work.title || index}
                  type="button"
                  style={{ flexGrow: isActive ? 5 : 1 }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => isActive ? setSelected(work) : setActiveIndex(index)}
                  aria-pressed={isActive}
                >
                  <div className="accordion-panel-media">
                    {coverUrl ? (
                      <img src={coverUrl} alt={work.title || ""} />
                    ) : (
                      <div className="work-cover-fallback"><span>{String(work.title || "9").slice(0, 1)}</span></div>
                    )}
                  </div>
                  <div className="accordion-panel-shade"></div>
                  <div className="accordion-panel-label">
                    <span className="accordion-panel-bar"></span>
                    <span>
                      <span className="accordion-panel-category">{getText(catLabels[work.category], lang, work.category)}</span>
                      <strong>{work.title}</strong>
                      {isActive && <small>{work.desc || getText(labels.view, lang, "View")} →</small>}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="portfolio-empty">此分类尚未加入作品。</p>
        )}
      </div>
      {selected && (
        <div className="modal-overlay open" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-media">
              <PortfolioMedia work={selected} />
            </div>
            <div className="modal-body">
              <div className="modal-category">{getText(catLabels[selected.category], lang, selected.category)}</div>
              <h2 className="modal-title">{selected.title}</h2>
              <p className="modal-desc">{selected.desc}</p>
              {workSourceUrl(selected) && (
                <a className="work-source-link" href={workSourceUrl(selected)} target="_blank" rel="noopener noreferrer">
                  在原始平台打开 ↗
                </a>
              )}
              <div className="modal-tech-title">{getText(labels.tech, lang, "Tech")}</div>
              <div className="modal-tech-tags">
                {selected.tech && selected.tech.map((tech, i) => (<span className="tech-tag" key={i}>{tech}</span>))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ========== Process ==========
function Process({ lang, siteContent }) {
  const labels = siteContent?.section_labels?.process || {};
  const steps = siteContent?.process || [];
  return (
    <section id="process" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(labels.eyebrow, lang, "WORKFLOW")}</div>
          <WarpText tag="h2" className="section-title" text={getText(labels.title, lang, "Process")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
          <p className="section-subtitle">{getText(labels.subtitle, lang, "")}</p>
        </div>
        <div className="process-timeline" style={{ "--process-count": Math.max(steps.length, 1) }}>
          {steps.map((s, i) => (
            <div className="process-step reveal reveal-delay-1" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="step-number">{s.num || `0${i+1}`}</div>
              <h3 className="step-title">{getText(s.title, lang, "")}</h3>
              <p className="step-desc">{getText(s.desc, lang, "")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== Pricing ==========
function Pricing({ lang, siteContent, pricingData }) {
  const labels = siteContent?.section_labels?.pricing || {};
  return (
    <section id="pricing" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(labels.eyebrow, lang, "PRICING")}</div>
          <WarpText tag="h2" className="section-title" text={getText(labels.title, lang, "Pricing")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
          <p className="section-subtitle">{getText(labels.subtitle, lang, "")}</p>
        </div>
        <div className="pricing-grid">
          {pricingData.map((item, i) => (
            <div className="pricing-card reveal-scale reveal-delay-1" key={i} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
              <div className="pricing-card-head">
                <h3 className="pricing-title">{item.title}</h3>
              </div>
              <div className="pricing-price">
                <span className="price-value">{item.price}</span>
                <span className="price-from">{getText(labels.from, lang, "from")}</span>
              </div>
              <p className="pricing-desc">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="pricing-note reveal">{getText(labels.note, lang, "")}</div>
      </div>
    </section>
  );
}

// ========== Testimonials ==========
function Testimonials({ lang, siteContent, testimonialsData }) {
  const labels = siteContent?.section_labels?.testimonials || {};
  const fallbackItems = siteContent?.testimonials || [];
  const items = testimonialsData?.items?.length ? testimonialsData.items : fallbackItems;
  const texts = siteContent?.testimonials_text || {};
  return (
    <section id="testimonials" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(labels.eyebrow, lang, "TESTIMONIALS")}</div>
          <WarpText tag="h2" className="section-title" text={getText(labels.title, lang, "Reviews")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
        </div>
        <div className="testimonials-grid">
          {items.map((item, i) => (
            <div className="testimonial-card reveal reveal-delay-1" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{item.text || getText(texts[item.text_key], lang, "")}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{item.initial || item.name?.[0] || "?"}</div>
                <div>
                  <div className="author-name">{item.name}</div>
                  <div className="author-role">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== Contact ==========
function Contact({ lang, siteContent, commissionStatus, settings }) {
  const [form, setForm] = useState({ name: "", email: "", type: "", message: "" });
  const [sent, setSent] = useState(false);
  const labels = siteContent?.section_labels?.contact || {};
  const formLabels = labels.form || {};
  const typeOptions = siteContent?.commission_type_options || {};
  const contact = siteContent?.contact || {};
  const statusClass = commissionStatus === "open" ? "status-open" : commissionStatus === "full" ? "status-full" : "status-paused";
  const statusText = getText(siteContent?.commission?.status?.[commissionStatus], lang, "");
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); setForm({ name: "", email: "", type: "", message: "" }); };

  return (
    <section id="contact" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{getText(labels.eyebrow, lang, "CONTACT")}</div>
          <WarpText tag="h2" className="section-title" text={getText(labels.title, lang, "Contact")} color="#c9c3e2" warpStrength={0.055} warpScale={1.35} pointerStrength={0.3} />
          <p className="section-subtitle">{getText(labels.subtitle, lang, "")}</p>
        </div>
        <div className="contact-grid">
          <form className="contact-form reveal" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{getText(formLabels.name, lang, "Name")}</label>
                <input className="form-input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{getText(formLabels.email, lang, "Email")}</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{getText(formLabels.type, lang, "Type")}</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                <option value="">{getText(formLabels.type_placeholder, lang, "Select")}</option>
                {Object.keys(typeOptions).map((key) => (
                  <option key={key} value={key}>{getText(typeOptions[key], lang, key)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{getText(formLabels.message, lang, "Message")}</label>
              <textarea className="form-textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required></textarea>
            </div>
            <SpecularButton type="submit" className="btn-submit">{sent ? getText(formLabels.sent, lang, "Sent!") : getText(formLabels.submit, lang, "Send")}</SpecularButton>
          </form>
          <div className="contact-info">
            <div className={`commission-big ${statusClass} reveal`}>
              <span className="status-dot"></span>
              <div>
                <div className="commission-big-label">{getText(labels.status_label, lang, "Status")}</div>
                <div className="commission-big-value">{statusText}</div>
              </div>
            </div>
            <div className="contact-item reveal reveal-delay-1">
              <div className="contact-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div><div className="contact-item-label">{getText(labels.email_label, lang, "Email")}</div><div className="contact-item-value">{settings?.contact_email || contact.email || "contact@9thstudio.com"}</div></div>
            </div>
            <div className="contact-item reveal reveal-delay-2">
              <div className="contact-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div><div className="contact-item-label">{getText(labels.discord_label, lang, "Discord")}</div><div className="contact-item-value">{settings?.contact_discord || contact.discord || "@kyu_506"}</div></div>
            </div>
            <div className="contact-item reveal reveal-delay-3">
              <div className="contact-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>
              <div><div className="contact-item-label">{getText(labels.social_label, lang, "Social")}</div><div className="contact-item-value">{settings?.contact_social || contact.social || "@kyu_506"}</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== Footer ==========
function Footer({ lang, siteContent }) {
  const footer = siteContent?.footer || {};
  const nav = siteContent?.nav || {};
  const services = siteContent?.services || [];
  const siteName = siteContent?.site?.name || "9th Studio";

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>{siteName}</span>
            </div>
            <p className="footer-tagline">{getText(footer.tagline, lang, "")}</p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
              <a href="#" className="social-icon" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#" className="social-icon" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0a0814"/></svg></a>
              <a href="#" className="social-icon" aria-label="Discord"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>{getText(footer.nav_title, lang, "Navigation")}</h4>
            <ul>
              <li><a href="#about">{getText(nav.about, lang, "About")}</a></li>
              <li><a href="#services">{getText(nav.services, lang, "Services")}</a></li>
              <li><a href="#portfolio">{getText(nav.portfolio, lang, "Works")}</a></li>
              <li><a href="#pricing">{getText(nav.pricing, lang, "Pricing")}</a></li>
              <li><a href="#contact">{getText(nav.contact, lang, "Contact")}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{getText(footer.services_title, lang, "Services")}</h4>
            <ul>
              {services.slice(0, 5).map((s, i) => (
                <li key={i}><a href="#services">{getText(s.title, lang, "")}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">© 2026 {siteName}. {getText(footer.rights, lang, "All rights reserved.")}</div>
          <div className="footer-copyright">{getText(footer.made, lang, "Made with ♥")}</div>
        </div>
      </div>
    </footer>
  );
}

// ========== 悬浮编辑按钮 ==========
function FloatingEditButton() {
  return (
    <a href="/admin/" target="_blank" rel="noopener noreferrer" style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: "9999",
      width: "52px", height: "52px", borderRadius: "50%",
      background: "linear-gradient(135deg, #b967ff, #ff6ec7)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 20px rgba(185,103,255,0.4)", cursor: "pointer",
      textDecoration: "none", fontSize: "22px", transition: "transform 0.2s ease",
    }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
       onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
       title="编辑内容">
      ✏️
    </a>
  );
}

// ========== App ==========
function App() {
  const { lang, setLang } = useLanguage();

  const [siteData, setSiteData] = useState({
    loading: true,
    settings: { commission_status: DEFAULT_COMMISSION_STATUS, logo_url: "", avatar_url: "" },
    works: [],
    pricing: [],
    testimonials: { items: [] },
    siteContent: {},
  });
  useScrollReveal(!siteData.loading);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [settingsRes, worksRes, pricingRes, testimonialsRes, contentRes] = await Promise.all([
          fetch("content/settings.json").then(r => r.json()).catch(() => ({})),
          fetch("content/works.json").then(r => r.json()).catch(() => ({ works: [] })),
          fetch("content/pricing.json").then(r => r.json()).catch(() => ({ items: [] })),
          fetch("content/testimonials.json").then(r => r.json()).catch(() => ({ items: [] })),
          fetch("content/site-content.json").then(r => r.json()).catch(() => ({})),
        ]);
        if (!cancelled) {
          setSiteData({
            loading: false,
            settings: { commission_status: DEFAULT_COMMISSION_STATUS, logo_url: "", avatar_url: "", ...settingsRes },
            works: worksRes.works || [],
            pricing: pricingRes.items || [],
            testimonials: testimonialsRes || { items: [] },
            siteContent: contentRes || {},
          });
        }
      } catch (e) {
        if (!cancelled) setSiteData(prev => ({ ...prev, loading: false }));
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const commissionStatus = siteData.settings.commission_status || DEFAULT_COMMISSION_STATUS;
  const logoUrl = siteData.settings.logo_url || DEFAULT_LOGO_URL;
  const avatarUrl = siteData.settings.avatar_url || DEFAULT_AVATAR_URL;

  if (siteData.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#8a84a8", fontFamily: "system-ui, sans-serif" }}>
        Loading...
      </div>
    );
  }

  return (
    <ClickSpark>
      <div className="app-container">
        <div className="bg-ambient">
          <div className="bg-stars layer-1"></div>
          <div className="bg-stars layer-2"></div>
          <div className="bg-stars layer-3"></div>
          <div className="bg-grid"></div>
        </div>
        <Navbar lang={lang} setLang={setLang} siteContent={siteData.siteContent} commissionStatus={commissionStatus} settings={siteData.settings} />
        <Hero lang={lang} siteContent={siteData.siteContent} commissionStatus={commissionStatus} avatarUrl={avatarUrl} settings={siteData.settings} />
        <About lang={lang} siteContent={siteData.siteContent} avatarUrl={avatarUrl} settings={siteData.settings} />
        <Services lang={lang} siteContent={siteData.siteContent} />
        <Portfolio lang={lang} siteContent={siteData.siteContent} worksData={siteData.works} />
        <Process lang={lang} siteContent={siteData.siteContent} />
        <Pricing lang={lang} siteContent={siteData.siteContent} pricingData={siteData.pricing} />
        <Testimonials lang={lang} siteContent={siteData.siteContent} testimonialsData={siteData.testimonials} />
        <Contact lang={lang} siteContent={siteData.siteContent} commissionStatus={commissionStatus} settings={siteData.settings} />
        <Footer lang={lang} siteContent={siteData.siteContent} />
        <FloatingEditButton />
      </div>
    </ClickSpark>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
