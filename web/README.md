# iConsole Client Landing Page

Сучасний landing page для iConsole Client - AI-powered настільного додатку для велотренувань.

## Технології

- **SolidJS** - Реактивний фреймворк
- **TypeScript** - Типізація
- **TailwindCSS** - Стилізація
- **Vite** - Збірка та dev server

## Запуск для розробки

```bash
# Встановити залежності
npm install

# Запустити dev server
npm run dev
```

## Збірка для продакшену

```bash
# Створити production build
npm run build

# Переглянути production збірку
npm run preview
```

## Структура проекту

```
web/
├── src/
│   ├── components/          # Компоненти
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Screenshots.tsx
│   │   ├── Download.tsx
│   │   └── Footer.tsx
│   ├── App.tsx             # Головний компонент
│   ├── main.tsx            # Точка входу
│   └── index.css           # Стилі
├── index.html              # HTML шаблон
├── vite.config.ts          # Конфігурація Vite
├── tailwind.config.js      # Конфігурація Tailwind
└── package.json
```

## Функції

- 🎨 Сучасний дизайн з темною темою
- 📱 Повністю адаптивний дизайн
- ⚡ Швидкий завантаження (SolidJS + Vite)
- 🎯 Smooth scrolling навігація
- 💾 Секції для завантаження додатку
- 🌐 Українська локалізація

## Деплой

Landing page можна задеплоїти на будь-який статичний хостинг:

- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

Після збірки (`npm run build`) всі файли будуть в папці `dist/`.
