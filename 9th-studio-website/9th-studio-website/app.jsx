const { useState, useEffect, useRef, useCallback } = React;

// ========== 默认值（当 JSON 加载失败或留空时使用） ==========
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
  const t = useCallback((key) => {
    const keys = key.split(".");
    let val = I18N[lang];
    for (const k of keys) { val = val?.[k]; }
    return val || key;
  }, [lang]);
  return { lang, setLang, t };
}

// ========== 滚动动画 Hook ==========
function useScrollReveal() {
  useEffect(() => {
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
  }, []);
}

// ========== 导航栏 ==========
function Navbar({ lang, setLang, t, commissionStatus }) {
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

  const navItems = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#portfolio", label: t("nav.portfolio") },
    { href: "#process", label: t("nav.process") },
    { href: "#pricing", label: t("nav.pricing") },
    { href: "#contact", label: t("nav.contact") },
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

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#hero" className="nav-logo" onClick={() => setMobileOpen(false)}>
            <span>9th Studio</span>
          </a>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.href}><a href={item.href}>{item.label}</a></li>
            ))}
          </ul>
          <div className="nav-actions">
            <div className={`commission-status ${statusClass}`}>
              <span className="status-dot"></span>
              <span>{t(`commission.status.${commissionStatus}`)}</span>
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
function Hero({ t, commissionStatus, avatarUrl, logoUrl }) {
  const statusClass = commissionStatus === "open" ? "status-open" : commissionStatus === "full" ? "status-full" : "status-paused";
  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <div className={`commission-badge ${statusClass}`}>
            <span className="status-dot"></span>
            <span>{t(`commission.badge.${commissionStatus}`)}</span>
          </div>
          <div className="hero-greeting">{t("hero.greeting")}</div>
          <h1 className="hero-name">Kyuu</h1>
          <div className="hero-subtitle">{t("hero.subtitle")}</div>
          <div className="hero-title">
            <span>Live 2D 建模师</span><span className="dot"></span>
            <span>VTuber Modeler</span><span className="dot"></span>
            <span>Illustrator</span>
          </div>
          <p className="hero-tagline">{t("hero.tagline")}</p>
          <div className="hero-cta">
            <a href="#portfolio" className="btn btn-primary">{t("hero.ctaWorks")} →</a>
            <a href="#contact" className="btn btn-secondary">{t("hero.ctaContact")}</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="avatar-wrapper">
            <div className="avatar-glow"></div>
            <div className="avatar-ring"></div>
            <div className="avatar-img"><img src={avatarUrl} alt="Kyuu avatar" /></div>
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
function About({ t, avatarUrl }) {
  const stats = [
    { value: "10+", label: t("about.stats.models") },
    { value: "2", label: t("about.stats.collaborators") },
    { value: "2023", label: t("about.stats.since") },
    { value: "6", label: t("about.stats.services") },
  ];
  const skills = ["Live2D", "VTuber Model", "Character Art", "Illustration", "VTS Accessories", "Emoji Design", "Clip Studio Paint", "Live2D Cubism", "SAI", "Procreate", "VBriger", "shoost", "Vtube Studio", "Pngtuber"];
  return (
    <section id="about" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("about.eyebrow")}</div>
          <h2 className="section-title">{t("about.title")}</h2>
          <p className="section-subtitle">{t("about.subtitle")}</p>
        </div>
        <div className="about-grid">
          <div className="about-image reveal">
            <img src={avatarUrl} alt="Kyuu" />
          </div>
          <div className="about-content">
            <p className="about-text reveal reveal-delay-1">{t("about.text1")}</p>
            <p className="about-text reveal reveal-delay-2">{t("about.text2")}</p>
            <div className="about-stats reveal reveal-delay-3">
              {stats.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="reveal reveal-delay-4">
              <h3 className="about-skills-title">{t("about.skillsTitle")}</h3>
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
function Services({ t }) {
  const services = [
    { icon: "🎭", title: t("services.vtuber.title"), desc: t("services.vtuber.desc") },
    { icon: "✨", title: t("services.live2d.title"), desc: t("services.live2d.desc") },
    { icon: "🎨", title: t("services.character.title"), desc: t("services.character.desc") },
    { icon: "🖌️", title: t("services.illustration.title"), desc: t("services.illustration.desc") },
    { icon: "💎", title: t("services.vts.title"), desc: t("services.vts.desc") },
    { icon: "😊", title: t("services.emoji.title"), desc: t("services.emoji.desc") },
  ];
  return (
    <section id="services" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("services.eyebrow")}</div>
          <h2 className="section-title">{t("services.title")}</h2>
          <p className="section-subtitle">{t("services.subtitle")}</p>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card reveal reveal-delay-1" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="service-icon"><span style={{ fontSize: "28px" }}>{s.icon}</span></div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== Portfolio ==========
function Portfolio({ t, worksData }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const categories = [
    { id: "all", label: t("portfolio.filter.all") },
    { id: "vtuber", label: t("portfolio.filter.vtuber") },
    { id: "live2d", label: t("portfolio.filter.live2d") },
    { id: "character", label: t("portfolio.filter.character") },
    { id: "illustration", label: t("portfolio.filter.illustration") },
    { id: "vts", label: t("portfolio.filter.vts") },
    { id: "emoji", label: t("portfolio.filter.emoji") },
  ];
  const filtered = filter === "all" ? worksData : worksData.filter((w) => w.category === filter);

  useEffect(() => {
    if (selected) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <section id="portfolio" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("portfolio.eyebrow")}</div>
          <h2 className="section-title">{t("portfolio.title")}</h2>
          <p className="section-subtitle">{t("portfolio.subtitle")}</p>
        </div>
        <div className="filter-bar reveal">
          {categories.map((c) => (
            <button key={c.id} className={`filter-btn ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.label}</button>
          ))}
        </div>
        <div className="works-grid">
          {filtered.map((w, i) => (
            <div className="work-card reveal reveal-delay-1" key={w.id} style={{ transitionDelay: `${(i % 3) * 0.1}s` }} onClick={() => setSelected(w)}>
              <div className="work-media">
                <div className="work-poster-overlay"></div>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(185,103,255,0.2), rgba(255,110,199,0.15))" }}>
                  <span style={{ fontSize: "48px", opacity: 0.6 }}>▶</span>
                </div>
              </div>
              <div className="play-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
              <div className="work-overlay">
                <div className="work-overlay-content">
                  <div className="work-category">{t(`portfolio.categories.${w.category}`)}</div>
                  <h3 className="work-title">{w.title}</h3>
                  <p className="work-desc">{w.desc}</p>
                  <span className="work-view">{t("portfolio.view")} →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="modal-overlay open" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-media">
              <video src={selected.video} controls autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}></video>
            </div>
            <div className="modal-body">
              <div className="modal-category">{t(`portfolio.categories.${selected.category}`)}</div>
              <h2 className="modal-title">{selected.title}</h2>
              <p className="modal-desc">{selected.desc}</p>
              <div className="modal-tech-title">{t("portfolio.tech")}</div>
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
function Process({ t }) {
  const steps = [
    { num: "01", title: t("process.step1.title"), desc: t("process.step1.desc") },
    { num: "02", title: t("process.step2.title"), desc: t("process.step2.desc") },
    { num: "03", title: t("process.step3.title"), desc: t("process.step3.desc") },
    { num: "04", title: t("process.step4.title"), desc: t("process.step4.desc") },
    { num: "05", title: t("process.step5.title"), desc: t("process.step5.desc") },
  ];
  return (
    <section id="process" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("process.eyebrow")}</div>
          <h2 className="section-title">{t("process.title")}</h2>
          <p className="section-subtitle">{t("process.subtitle")}</p>
        </div>
        <div className="process-timeline">
          {steps.map((s, i) => (
            <div className="process-step reveal reveal-delay-1" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="step-number">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== Pricing ==========
function Pricing({ t, pricingData }) {
  return (
    <section id="pricing" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("pricing.eyebrow")}</div>
          <h2 className="section-title">{t("pricing.title")}</h2>
          <p className="section-subtitle">{t("pricing.subtitle")}</p>
        </div>
        <div className="pricing-grid">
          {pricingData.map((item, i) => (
            <div className="pricing-card reveal-scale reveal-delay-1" key={i} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
              <div className="pricing-card-head">
                <h3 className="pricing-title">{item.title}</h3>
              </div>
              <div className="pricing-price">
                <span className="price-value">{item.price}</span>
                <span className="price-from">{t("pricing.from")}</span>
              </div>
              <p className="pricing-desc">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="pricing-note reveal">{t("pricing.note")}</div>
      </div>
    </section>
  );
}

// ========== Testimonials ==========
function Testimonials({ t }) {
  const items = [
    { name: "Aoi", role: "VTuber", text: t("testimonials.t1.text"), initial: "A" },
    { name: "Ren", role: "Streamer", text: t("testimonials.t2.text"), initial: "R" },
    { name: "Mika", role: "Content Creator", text: t("testimonials.t3.text"), initial: "M" },
  ];
  return (
    <section id="testimonials" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("testimonials.eyebrow")}</div>
          <h2 className="section-title">{t("testimonials.title")}</h2>
        </div>
        <div className="testimonials-grid">
          {items.map((item, i) => (
            <div className="testimonial-card reveal reveal-delay-1" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">{item.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{item.initial}</div>
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
function Contact({ t, commissionStatus }) {
  const [form, setForm] = useState({ name: "", email: "", type: "", message: "" });
  const [sent, setSent] = useState(false);
  const statusClass = commissionStatus === "open" ? "status-open" : commissionStatus === "full" ? "status-full" : "status-paused";
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); setForm({ name: "", email: "", type: "", message: "" }); };
  return (
    <section id="contact" className="section">
      <div className="section-inner">
        <div className="section-head reveal">
          <div className="eyebrow">{t("contact.eyebrow")}</div>
          <h2 className="section-title">{t("contact.title")}</h2>
          <p className="section-subtitle">{t("contact.subtitle")}</p>
        </div>
        <div className="contact-grid">
          <form className="contact-form reveal" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t("contact.form.name")}</label>
                <input className="form-input" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t("contact.form.email")}</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t("contact.form.type")}</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                <option value="">{t("contact.form.typePlaceholder")}</option>
                <option value="vtuber">{t("contact.form.typeVtuber")}</option>
                <option value="live2d">{t("contact.form.typeLive2d")}</option>
                <option value="character">{t("contact.form.typeCharacter")}</option>
                <option value="illustration">{t("contact.form.typeIllustration")}</option>
                <option value="vts">{t("contact.form.typeVts")}</option>
                <option value="emoji">{t("contact.form.typeEmoji")}</option>
                <option value="other">{t("contact.form.typeOther")}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t("contact.form.message")}</label>
              <textarea className="form-textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required></textarea>
            </div>
            <button type="submit" className="btn-submit">{sent ? t("contact.form.sent") : t("contact.form.submit")}</button>
          </form>
          <div className="contact-info">
            <div className={`commission-big ${statusClass} reveal`}>
              <span className="status-dot"></span>
              <div>
                <div className="commission-big-label">{t("contact.statusLabel")}</div>
                <div className="commission-big-value">{t(`commission.status.${commissionStatus}`)}</div>
              </div>
            </div>
            <div className="contact-item reveal reveal-delay-1">
              <div className="contact-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div><div className="contact-item-label">{t("contact.emailLabel")}</div><div className="contact-item-value">contact@9thstudio.com</div></div>
            </div>
            <div className="contact-item reveal reveal-delay-2">
              <div className="contact-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div><div className="contact-item-label">{t("contact.discordLabel")}</div><div className="contact-item-value">@kyu_506</div></div>
            </div>
            <div className="contact-item reveal reveal-delay-3">
              <div className="contact-item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>
              <div><div className="contact-item-label">{t("contact.socialLabel")}</div><div className="contact-item-value">@kyu_506</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== Footer ==========
function Footer({ t, logoUrl }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span>9th Studio</span>
            </div>
            <p className="footer-tagline">{t("footer.tagline")}</p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
              <a href="#" className="social-icon" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#" className="social-icon" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0a0814"/></svg></a>
              <a href="#" className="social-icon" aria-label="Discord"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>{t("footer.navTitle")}</h4>
            <ul>
              <li><a href="#about">{t("nav.about")}</a></li>
              <li><a href="#services">{t("nav.services")}</a></li>
              <li><a href="#portfolio">{t("nav.portfolio")}</a></li>
              <li><a href="#pricing">{t("nav.pricing")}</a></li>
              <li><a href="#contact">{t("nav.contact")}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("footer.servicesTitle")}</h4>
            <ul>
              <li><a href="#services">{t("services.vtuber.title")}</a></li>
              <li><a href="#services">{t("services.live2d.title")}</a></li>
              <li><a href="#services">{t("services.character.title")}</a></li>
              <li><a href="#services">{t("services.illustration.title")}</a></li>
              <li><a href="#services">{t("services.vts.title")}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">© 2026 9th Studio. {t("footer.rights")}</div>
          <div className="footer-copyright">{t("footer.made")}</div>
        </div>
      </div>
    </footer>
  );
}

// ========== App ==========
function App() {
  const { lang, setLang, t } = useLanguage();
  useScrollReveal();

  // 从外部 JSON 加载数据
  const [siteData, setSiteData] = useState({
    loading: true,
    settings: { commission_status: DEFAULT_COMMISSION_STATUS, logo_url: "", avatar_url: "" },
    works: [],
    pricing: [],
  });

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [settingsRes, worksRes, pricingRes] = await Promise.all([
          fetch("content/settings.json").then(r => r.json()).catch(() => ({})),
          fetch("content/works.json").then(r => r.json()).catch(() => ({ works: [] })),
          fetch("content/pricing.json").then(r => r.json()).catch(() => ({ items: [] })),
        ]);
        if (!cancelled) {
          setSiteData({
            loading: false,
            settings: { commission_status: DEFAULT_COMMISSION_STATUS, logo_url: "", avatar_url: "", ...settingsRes },
            works: worksRes.works || [],
            pricing: pricingRes.items || [],
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
    <div className="app-container">
      <div className="bg-ambient">
        <div className="bg-stars layer-1"></div>
        <div className="bg-stars layer-2"></div>
        <div className="bg-stars layer-3"></div>
        <div className="bg-grid"></div>
      </div>
      <Navbar lang={lang} setLang={setLang} t={t} commissionStatus={commissionStatus} />
      <Hero t={t} commissionStatus={commissionStatus} avatarUrl={avatarUrl} logoUrl={logoUrl} />
      <About t={t} avatarUrl={avatarUrl} />
      <Services t={t} />
      <Portfolio t={t} worksData={siteData.works} />
      <Process t={t} />
      <Pricing t={t} pricingData={siteData.pricing} />
      <Testimonials t={t} />
      <Contact t={t} commissionStatus={commissionStatus} />
      <Footer t={t} logoUrl={logoUrl} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
