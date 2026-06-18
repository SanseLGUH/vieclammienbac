# МойСайт — Nuxt 3 Стартер

## 🚀 Быстрый старт

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # Продакшн-сборка
npm run generate  # Статический экспорт
```

---

## 📁 Структура проекта

```
nuxt-app/
├── app.vue                  # Корневой компонент (не трогать)
├── nuxt.config.ts           # ⚙️ Главный конфиг: SEO, модули, заголовки
│
├── assets/
│   └── css/
│       └── main.css         # 🎨 CSS-переменные: цвета, шрифты, размеры
│
├── layouts/
│   └── default.vue          # 🖼 Лэйаут: навбар + контент + футер
│
├── components/
│   ├── AppNavbar.vue        # 🔝 Верхняя панель — меню, логотип, бургер
│   └── AppFooter.vue        # 🔽 Подвал сайта
│
└── pages/
    ├── index.vue            # 🏠 Главная страница
    ├── about.vue            # ℹ️ О нас (шаблон)
    ├── services.vue         # 🛠 Услуги (добавьте сами)
    ├── blog.vue             # 📝 Блог (добавьте сами)
    └── contact.vue          # 📞 Контакты (добавьте сами)
```

---

## ✏️ Как кастомизировать

### 1. Изменить цвета и шрифты
Откройте `assets/css/main.css` и поменяйте значения в `:root { }`:

```css
--color-accent:  #c8a97e;   /* Главный акцент */
--color-bg:      #0e0e0e;   /* Фон */
--font-display:  'Playfair Display', serif;  /* Шрифт заголовков */
```

### 2. Добавить / убрать пункт меню
Откройте `components/AppNavbar.vue`, найдите массив `navLinks`:

```js
const navLinks = [
  { label: 'Главная',  to: '/' },
  { label: 'О нас',    to: '/about' },
  // Добавьте свой пункт:
  { label: 'Портфолио', to: '/portfolio' },
]
```

### 3. Изменить содержимое главной страницы
Откройте `pages/index.vue`, все тексты собраны в объектах в начале `<script setup>`:

```js
const hero = {
  badge:    'Ваш бейдж',
  title:    'Ваш заголовок',
  subtitle: 'Ваше описание...',
}
```

### 4. Добавить новую страницу
Создайте файл в папке `pages/`, например `pages/portfolio.vue`:

```vue
<script setup>
useHead({ title: 'Портфолио' })
</script>

<template>
  <section class="section">
    <div class="container">
      <h1>Портфолио</h1>
    </div>
  </section>
</template>
```

Nuxt автоматически создаст маршрут `/portfolio`.

### 5. Изменить SEO и мета-теги
В `nuxt.config.ts` → секция `app.head`:

```ts
title: 'Название вашего сайта',
meta: [
  { name: 'description', content: 'Описание для поисковиков' },
]
```

---

## 🎨 Добавить Google Fonts

В `nuxt.config.ts` → `app.head.link` — уже подключён `Playfair Display + DM Sans`.
Замените URL на нужный с [fonts.google.com](https://fonts.google.com).

---

## 📦 Деплой

| Платформа | Команда |
|-----------|---------|
| Vercel    | `vercel` (автоматически) |
| Netlify   | `npm run generate` → папка `.output/public` |
| Node.js   | `npm run build` → `node .output/server/index.mjs` |
