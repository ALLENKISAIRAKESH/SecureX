/* ── Landing Page ────────────────────────────────────────── */

const SHIELD_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="sg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#00d4ff"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
  <path d="M16 2L4 7v9c0 7.73 5.11 14.26 12 16 6.89-1.74 12-8.27 12-16V7L16 2z" fill="url(#sg)" opacity="0.15"/>
  <path d="M16 2L4 7v9c0 7.73 5.11 14.26 12 16 6.89-1.74 12-8.27 12-16V7L16 2z" stroke="url(#sg)" stroke-width="1.5" fill="none"/>
  <path d="M12 16l3 3 5-6" stroke="url(#sg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

function renderLanding() {
  return `
    <div class="landing-page page-enter">
      <!-- Animated Orbs -->
      <div class="orb-container">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <!-- Navbar -->
      <nav class="navbar" id="landingNav">
        <div class="nav-inner">
          <a class="nav-logo" href="#/">${SHIELD_SVG}<span>Secure<span class="text-gradient">X</span></span></a>
          <div class="nav-links">
            <a class="nav-link" href="#features">Features</a>
            <a class="nav-link" href="#pricing">Pricing</a>
            <a class="nav-link" href="#/docs">Docs & API</a>
            <a class="nav-link" href="/demo.html" target="_blank" style="color: var(--accent-cyan);">Live Demo ↗</a>
          </div>
          <div class="nav-actions">
            ${API.isLoggedIn()
              ? '<a class="btn btn-primary btn-sm" href="#/dashboard">Dashboard</a>'
              : '<a class="btn btn-ghost btn-sm" href="#/login">Sign in</a><a class="btn btn-primary btn-sm" href="#/register">Get Started</a>'
            }
          </div>
          <button class="nav-hamburger" id="navHamburger" aria-label="Menu">☰</button>
        </div>
      </nav>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <div class="badge badge-cyan" style="margin-bottom:16px">🔒 AUTHENTICATION AS A SERVICE</div>
          <h1>Authentication,<br><span class="text-gradient">Simplified.</span></h1>
          <p>Integrate robust authentication into any app in minutes. Focus on building, we handle the security.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="#/register">Start for Free →</a>
            <a class="btn btn-secondary btn-lg" href="#/docs">API Reference →</a>
          </div>
        </div>
        <div class="hero-code">
          <div class="code-dots">
            <span class="code-dot red"></span>
            <span class="code-dot yellow"></span>
            <span class="code-dot green"></span>
          </div>
          <div class="code-block">
            <div><span class="keyword">import</span> { SecureX } <span class="keyword">from</span> <span class="string">'@securex/auth'</span>;</div>
            <br>
            <div><span class="comment">// Initialize in one line</span></div>
            <div><span class="keyword">const</span> auth = <span class="keyword">new</span> <span class="func">SecureX</span>({</div>
            <div>  apiKey: <span class="string">'sx_live_a8f3...'</span>,</div>
            <div>  features: [<span class="string">'2fa'</span>, <span class="string">'sso'</span>]</div>
            <div>});</div>
            <br>
            <div><span class="comment">// Authenticate users</span></div>
            <div><span class="keyword">const</span> user = <span class="keyword">await</span> auth.<span class="func">login</span>({</div>
            <div>  email: <span class="string">'user@app.com'</span>,</div>
            <div>  password: <span class="string">'•••••••••'</span></div>
            <div>});</div>
          </div>
        </div>
      </section>

      <!-- Trusted By -->
      <section class="trusted-section">
        <div class="trusted-label">Trusted by developers worldwide</div>
        <div class="trusted-logos">
          <span>VERCEL</span>
          <span>STRIPE</span>
          <span>NOTION</span>
          <span>FIGMA</span>
          <span>LINEAR</span>
        </div>
      </section>

      <!-- Features -->
      <section class="features-section" id="features">
        <div class="section-header">
          <div class="badge badge-purple">FEATURES</div>
          <h2>Everything you need<br>to <span class="text-gradient">secure your app</span></h2>
          <p>From basic authentication to enterprise SSO, SecureX provides a complete toolkit.</p>
        </div>
        <div class="features-grid">
          <div class="glass-card feature-card">
            <div class="feature-icon cyan">🔑</div>
            <h3>Single Sign-On</h3>
            <p>Enable enterprise SSO with SAML, OAuth, and OpenID Connect across all major identity providers.</p>
          </div>
          <div class="glass-card feature-card">
            <div class="feature-icon purple">📱</div>
            <h3>Two-Factor Auth</h3>
            <p>TOTP authenticator app support with QR code setup, backup codes, and flexible enforcement policies.</p>
          </div>
          <div class="glass-card feature-card">
            <div class="feature-icon blue">🗝️</div>
            <h3>API Key Management</h3>
            <p>Generate, rotate, and revoke API keys with granular permissions, usage tracking, and expiration controls.</p>
          </div>
          <div class="glass-card feature-card">
            <div class="feature-icon green">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Track authentication events, user activity, threat detection, and security metrics in a live dashboard.</p>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-section" id="how">
        <div class="section-header">
          <div class="badge badge-green">HOW IT WORKS</div>
          <h2>Up and running<br>in <span class="text-gradient">three steps</span></h2>
        </div>
        <div class="steps-grid">
          <div class="glass-card step-card">
            <div class="step-number">1</div>
            <h3>Install the SDK</h3>
            <p>Add SecureX to your project with a single package install.</p>
            <div class="step-code">npm install @securex/auth</div>
          </div>
          <div class="glass-card step-card">
            <div class="step-number">2</div>
            <h3>Configure</h3>
            <p>Set your API key and choose which features to enable.</p>
            <div class="step-code">securex.init({ apiKey: '...' })</div>
          </div>
          <div class="glass-card step-card">
            <div class="step-number">3</div>
            <h3>Ship It</h3>
            <p>Your users get a secure, beautiful login experience out of the box.</p>
            <div class="step-code">securex.login() ✓</div>
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section class="pricing-section" id="pricing">
        <div class="section-header">
          <div class="badge badge-amber">PRICING</div>
          <h2>Simple, transparent<br><span class="text-gradient">pricing</span></h2>
          <p>Start free, scale as you grow. No hidden fees.</p>
        </div>
        <div class="pricing-grid">
          <div class="glass-card pricing-card">
            <div class="plan-name">Free</div>
            <div class="price">$0</div>
            <div class="price-period">forever</div>
            <a class="btn btn-secondary" href="#/register" style="width:100%">Get Started</a>
            <ul class="pricing-features">
              <li>Up to 1,000 users</li>
              <li>Email & password auth</li>
              <li>2 API keys</li>
              <li>Basic analytics</li>
              <li>Community support</li>
            </ul>
          </div>
          <div class="glass-card pricing-card popular">
            <div class="pricing-popular-badge"><span class="badge badge-cyan">MOST POPULAR</span></div>
            <div class="plan-name">Pro</div>
            <div class="price text-gradient">$29</div>
            <div class="price-period">per month</div>
            <a class="btn btn-primary" href="#/register" style="width:100%">Start Free Trial</a>
            <ul class="pricing-features">
              <li>Up to 50,000 users</li>
              <li>SSO & social login</li>
              <li>TOTP two-factor auth</li>
              <li>Unlimited API keys</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
          </div>
          <div class="glass-card pricing-card">
            <div class="plan-name">Enterprise</div>
            <div class="price">Custom</div>
            <div class="price-period">let's talk</div>
            <a class="btn btn-secondary" href="#/register" style="width:100%">Contact Sales</a>
            <ul class="pricing-features">
              <li>Unlimited users</li>
              <li>SAML & custom providers</li>
              <li>Audit logs & compliance</li>
              <li>Dedicated infrastructure</li>
              <li>SLA guarantee</li>
              <li>24/7 dedicated support</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="nav-logo">${SHIELD_SVG}<span>Secure<span class="text-gradient">X</span></span></div>
            <p>Enterprise-grade authentication for modern applications. Built for developers, trusted by teams.</p>
          </div>
          <div class="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">Documentation</a>
            <a href="#">Changelog</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 SecureX. All rights reserved.</span>
          <span>Built with 🔒 for developers</span>
        </div>
      </footer>
    </div>
  `;
}
