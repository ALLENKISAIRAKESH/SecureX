/* ── SPA Router ──────────────────────────────────────────── */

const Router = {
  routes: {},
  app: null,

  init() {
    this.app = document.getElementById('app');

    // Define routes
    this.routes = {
      '/': { render: () => renderLanding(), init: () => this.initLandingNav() },
      '/docs': { render: () => renderDocs(), init: () => initDocs() },
      '/login': { render: () => renderAuth('login'), init: () => initAuthPage('login') },
      '/register': { render: () => renderAuth('register'), init: () => initAuthPage('register') },
      '/2fa': { render: () => render2FAPrompt(), init: () => init2FAPage() },
      '/dashboard': { render: () => renderDashboard('overview'), init: () => initDashboard('overview'), auth: true },
      '/dashboard/users': { render: () => renderDashboard('users'), init: () => initDashboard('users'), auth: true },
      '/dashboard/keys': { render: () => renderDashboard('keys'), init: () => initDashboard('keys'), auth: true },
      '/dashboard/webhooks': { render: () => renderDashboard('webhooks'), init: () => initDashboard('webhooks'), auth: true },
      '/dashboard/logs': { render: () => renderDashboard('logs'), init: () => initDashboard('logs'), auth: true },
      '/dashboard/security': { render: () => renderDashboard('security'), init: () => initDashboard('security'), auth: true },
      '/dashboard/settings': { render: () => renderDashboard('settings'), init: () => initDashboard('settings'), auth: true },
    };

    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  },

  navigate() {
    let hash = window.location.hash.replace('#', '') || '/';
    if (!hash.startsWith('/')) hash = '/' + hash;

    const route = this.routes[hash];

    if (!route) {
      // Fallback to landing
      window.location.hash = '#/';
      return;
    }

    // Auth guard
    if (route.auth && !API.isLoggedIn()) {
      Toast.info('Please sign in to continue.');
      window.location.hash = '#/login';
      return;
    }

    // Redirect logged-in users from auth pages to dashboard
    if ((hash === '/login' || hash === '/register') && API.isLoggedIn()) {
      window.location.hash = '#/dashboard';
      return;
    }

    // Render
    this.app.innerHTML = route.render();

    // Scroll to top
    window.scrollTo(0, 0);

    // Initialize page-specific logic
    if (route.init) {
      setTimeout(() => route.init(), 50);
    }
  },

  initLandingNav() {
    // Navbar scroll effect
    const navbar = document.getElementById('landingNav');
    if (navbar) {
      const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      };
      window.addEventListener('scroll', onScroll);
      onScroll();
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('#/') || href === '#') return;
      // It's an anchor like #features, #pricing
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Hamburger menu
    const hamburger = document.getElementById('navHamburger');
    if (hamburger) {
      hamburger.onclick = () => {
        const links = document.querySelector('.nav-links');
        if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
      };
    }
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => Router.init());
