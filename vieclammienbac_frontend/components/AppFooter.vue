<script setup lang="ts">
const siteName = 'ViecLamMienBac'
const year = '2024'

const footerLinks = [
  { label: 'Cam kết bảo mật', to: '/commitment-to-confidentiality' },
  { label: 'Liên hệ', to: '/contact' },
]

const services = [
  'Cho thuê lao động ngắn và dài hạn',
  'Tuyển dụng công nhân chính thức cho các doanh nghiệp',
  'Tuyển dụng nhân sự cấp trung & cao',
  'Tuyển dụng nhân viên văn phòng, kỹ sư, kỹ thuật viên',
  'Tổ chức các ngày hội việc làm',
  'Các dịch vụ nhân sự khác',
]

const mottos = [
  'Tìm việc làm cho người lao động như tìm việc làm cho chính mình và người thân',
  'Tìm lao động cho doanh nghiệp như tìm lao động cho chính công ty của mình',
]

const businessInfo = [
  { icon: 'ti-map-pin',         text: 'Số 16/562 Nguyễn Văn Linh, phường An Biên, Tp.Hải Phòng, Việt Nam' },
  { icon: 'ti-id-badge',        text: 'MST: 0201910513' },
  { icon: 'ti-file-certificate', text: 'GP DVVL số: 0050/2024 (GH)' },
  { icon: 'ti-file-certificate', text: 'GP thuê lao động số: 49/2025SHP' },
  { icon: 'ti-phone',           text: 'Điện thoại: 0225 3785 886' },
]

const socialLinks = [
  {
    icon: 'ti-brand-hipchat',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Zalo-App-Rec.png',
    label: 'Zalo: 0789 393 079',
    href: null,
  },
  {
    icon: 'ti-brand-facebook',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Facebook_icon_2013.svg',
    label: 'Fanpage: Việc Làm Miền Bắc',
    href: 'https://web.facebook.com/profile.php?id=61589728990209',
  },
  {
    icon: 'ti-brand-tiktok',
    logo: 'https://cdn.pixabay.com/photo/2021/06/15/12/28/tiktok-6338432_960_720.png',
    label: 'Tiktok: Việc Làm Miền Bắc',
    href: 'https://www.tiktok.com/@vieclammienbacvmb?_r=1&_t=ZS-97AFw8XtM9t',
  },
]
</script>

<template>
  <footer class="footer">
    <div class="container footer__grid">

      <div class="footer__col">
        <div class="col-label">
          <i class="ti ti-briefcase" aria-hidden="true" />
          Dịch vụ của chúng tôi
        </div>
        <ul class="col-body">
          <li v-for="item in services" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="footer__col">
        <div class="col-label">
          <i class="ti ti-heart" aria-hidden="true" />
          Phương châm phục vụ
        </div>
        <ul class="col-body">
          <li v-for="item in mottos" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="footer__col">
        <div class="col-label">
          <i class="ti ti-building" aria-hidden="true" />
          Thông tin phục vụ doanh nghiệp
        </div>
        <ul class="col-body col-body--icons">
          <li v-for="item in businessInfo" :key="item.text">
            <i :class="`ti ${item.icon}`" aria-hidden="true" />
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <div class="footer__col">
        <div class="col-label">
          <i class="ti ti-users" aria-hidden="true" />
          Thông tin phục vụ người lao động
        </div>
        <ul class="col-body col-body--icons">
          <li v-for="link in socialLinks" :key="link.label" class="social-item">
            <i :class="`ti ${link.icon}`" aria-hidden="true" />
            <a
              v-if="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
            >
              <img :src="link.logo" :alt="link.label" class="social-logo" />
              {{ link.label }}
            </a>
            <span v-else class="social-link">
              <img :src="link.logo" :alt="link.label" class="social-logo" />
              {{ link.label }}
            </span>
          </li>
        </ul>
      </div>

    </div>

    <div class="container footer__bottom">
      <span>© {{ year }} {{ siteName }}. Mọi quyền được bảo lưu.</span>
      <nav class="footer__links">
        <NuxtLink
          v-for="link in footerLinks"
          :key="link.to"
          :to="link.to"
          class="footer__link"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

/* ── Grid ─────────────────────────────────────────────── */
.footer__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding-top: 2.5rem;
  padding-bottom: 2rem;
  align-items: start;
}

@media (max-width: 900px) { .footer__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .footer__grid { grid-template-columns: 1fr; } }

/* ── Column label ─────────────────────────────────────── */
.col-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.75rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.col-label i {
  font-size: 14px;
  color: var(--color-muted);
}

/* ── Column body ──────────────────────────────────────── */
.col-body {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.col-body li {
  position: relative;
  padding-left: 0.9rem;
  font-size: 0.76rem;
  line-height: 1.65;
  color: var(--color-muted);
}

.col-body li::before {
  content: '–';
  position: absolute;
  left: 0;
  opacity: 0.5;
  color: var(--color-muted);
}

/* Icon list variant */
.col-body--icons li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding-left: 0;
}

.col-body--icons li::before { display: none; }

.col-body--icons i {
  flex-shrink: 0;
  margin-top: 3px;
  font-size: 13px;
  color: var(--color-muted);
  opacity: 0.6;
}

/* ── Social links ─────────────────────────────────────── */
.social-item { align-items: center; }

.social-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.social-link:hover { color: #1877F2; opacity: 1; }

.social-logo {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Bottom bar ───────────────────────────────────────── */
.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1.25rem;
  padding-bottom: 1.5rem;
  font-size: 0.74rem;
  color: var(--color-muted);
  border-top: 1px solid var(--color-border);
}

.footer__links {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.footer__link {
  font-size: 0.74rem;
  color: var(--color-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.footer__link:hover { color: var(--color-accent); }
</style>