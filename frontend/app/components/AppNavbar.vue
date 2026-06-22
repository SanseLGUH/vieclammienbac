  <script setup lang="ts">
    const navLinks = [
      { label: 'Trang chủ', to: '/' },
      { label: 'Việc làm', to: '/jobs' },
    ]

    const siteName = 'Việc Làm Miền Bắc'

    const mobileOpen = ref(false)
    const toggleMobile = () => (mobileOpen.value = !mobileOpen.value)

    const route = useRoute()
    watch(() => route.path, () => (mobileOpen.value = false))
  </script>

  <template>
    <header class="navbar">
      <nav class="container navbar__inner">
        <button class="navbar__burger" @click="toggleMobile" :class="{ open: mobileOpen }" aria-label="Menu">
          <span /><span /><span />
        </button>

        <NuxtLink to="/" class="navbar__logo">
          <img src="https://drive.vieclammienbac.com/download?id=42b57492-12af-4a54-842f-1767d1088080" class="navbar__logo-img">
        </NuxtLink>

        <ul class="navbar__links">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink :to="link.to" class="navbar__link">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <NuxtLink to="/profile" class="avatar-link">
          <div class="avatar">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <circle cx="20" cy="20" r="20" fill="#f0f0f0"/>
              <circle cx="20" cy="16" r="7" fill="#c0c0c0"/>
              <path d="M4 38c0-8.837 7.163-14 16-14s16 5.163 16 14" fill="#c0c0c0"/>
            </svg>
          </div>
        </NuxtLink>
      </nav>

      <Transition name="mobile-menu">
        <div v-if="mobileOpen" class="navbar__mobile">
          <ul>
            <li v-for="link in navLinks" :key="link.to" style="margin-bottom: 10px;">
              <NuxtLink :to="link.to" class="navbar__mobile-link" @click="mobileOpen = false">{{ link.label }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/profile" class="mobile-profile-card" @click="mobileOpen = false">
                <div class="mobile-avatar">
                  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
                    <circle cx="30" cy="30" r="30" fill="#f0f0f0"/>
                    <circle cx="30" cy="24" r="10" fill="#c0c0c0"/>
                    <path d="M6 56c0-13.255 10.745-21 24-21s24 7.745 24 21" fill="#c0c0c0"/>
                  </svg>
                </div>
                <div class="mobile-profile-info">
                  <span class="mobile-profile-name">Khách</span>
                  <span class="mobile-profile-sub">Xem hồ sơ →</span>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </Transition>
    </header>
  </template>

  <style scoped>
    * { font-family: 'Bungee', sans-serif; }

    .navbar__logo-img {
      height: 44px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      height: var(--nav-height, 64px);
      background: #fff;

      border-bottom: 1px solid #1d1d1d;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .navbar__inner {
      display: flex;
      align-items: center;
      height: 100%;
      justify-content: space-between;
    }
    .navbar__logo {
      font-family: 'Bungee', sans-serif;
      font-size: 1.3rem;
      color: #54B5FF;
      white-space: nowrap;
      text-decoration: none;
      letter-spacing: 0.02em;
      transition: color 0.2s;
    }
    .navbar__logo:hover { color: #1d1d1d; }

    .navbar__links {
      display: flex;
      align-items: center;
      gap: .25rem;
      list-style: none;
      margin-left: auto;
      padding: 0;
    }
    .navbar__link {
      font-family: 'DM Sans', sans-serif;
      padding: .45rem .9rem;
      border-radius: 6px;
      font-size: 1.1rem;
      color: #1d1d1d;
      text-decoration: none;
      letter-spacing: 0.03em;
      transition: color 0.2s, background 0.2s;
    }
    .navbar__link:hover {
      color: #54B5FF;
      background: rgba(84, 181, 255, 0.08);
    }
    .navbar__link.router-link-exact-active { color: #54B5FF; }

    .avatar-link {
      text-decoration: none;
      display: flex;
      align-items: center;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      transition: border-color 0.2s, box-shadow 0.2s;
      cursor: pointer;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar:hover {
      border-color: #54B5FF;
      box-shadow: 0 0 0 3px rgba(84, 181, 255, 0.15);
    }
    .avatar svg {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 50%;
    }

    /* Three Lines Burger Styles */
    .navbar__burger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: .5rem;
      width: 40px;
      height: 40px;
      z-index: 101; /* Keep above drawer if layout overlaps */
    }
    .navbar__burger span {
      display: block;
      width: 24px;
      height: 2px;
      background: #1d1d1d;
      border-radius: 2px;
      transition: all 0.2s;
      transform-origin: center;
    }
    
    /* Transforms three lines into an X mark when open */
    .navbar__burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: #54B5FF; }
    .navbar__burger.open span:nth-child(2) { opacity: 0; }
    .navbar__burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: #54B5FF; }

    /* Left-side Drawer Panel on Mobile */
    .navbar__mobile {
      position: fixed;
      top: var(--nav-height, 64px);
      left: 0;
      bottom: 0;
      width: 280px; /* Panel width */
      max-width: 85vw;
      background: #fff;
      border-right: 2px solid #1d1d1d;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      box-sizing: border-box;
    }
    .navbar__mobile ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: .25rem;
      padding: 0;
      margin: 0;
    }
    .navbar__mobile-link {
      font-family: 'Bungee', sans-serif;
      display: block;
      padding: .65rem .75rem;
      border-radius: 6px;
      font-size: 1rem;
      color: #1d1d1d;
      text-decoration: none;
      letter-spacing: 0.03em;
      transition: color 0.2s, background 0.2s;
    }
    .navbar__mobile-link:hover,
    .navbar__mobile-link.router-link-exact-active {
      color: #54B5FF;
      background: rgba(84, 181, 255, 0.08);
    }

    .mobile-profile-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      text-decoration: none;
      margin-top: 8px;
      transition: border-color 0.2s, background 0.2s;
    }
    .mobile-profile-card:hover {
      border-color: #54B5FF;
      background: rgba(84, 181, 255, 0.04);
    }
    .mobile-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mobile-avatar svg {
      width: 52px;
      height: 52px;
      display: block;
      border-radius: 50%;
    }
    .mobile-profile-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .mobile-profile-name {
      font-family: 'Bungee', sans-serif;
      font-size: 15px;
      color: #1d1d1d;
      letter-spacing: 0.02em;
    }
    .mobile-profile-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #54B5FF;
    }

    /* Left-to-Right Slide Animations */
    .mobile-menu-enter-active,
    .mobile-menu-leave-active { 
      transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1), opacity .2s; 
    }
    .mobile-menu-enter-from,
    .mobile-menu-leave-to { 
      opacity: 0;
      transform: translateX(-100%); /* Slides entirely off screen to the left */
    }

    /* Mobile Responsive View overrides */
    @media (max-width: 960px) {
      .navbar__links { 
        display: none; 
      }
      .navbar__burger { 
        display: flex; 
        order: 1; /* Left side */
      }
      .navbar__logo {
        order: 2; /* Center */
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }
      .avatar-link {
        order: 3; /* Right side */
      }
    }
  </style>