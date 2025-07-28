# Tailwind CSS Troubleshooting Guide

## Issue: Tailwind CSS styles not applying

If you're seeing unstyled content instead of the beautiful Tailwind design, follow these steps:

### 1. Check if Tailwind is properly imported

Make sure the global CSS file is imported in your layout:

```tsx
// app/layout.tsx
import '../styles/globals.css';
```

### 2. Verify Tailwind configuration

Check that your `tailwind.config.js` includes the correct content paths:

```js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... rest of config
};
```

### 3. Check PostCSS configuration

Ensure your `postcss.config.js` is correct:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 4. Verify dependencies are installed

Make sure these packages are in your `package.json`:

```json
{
  "dependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

### 5. Clear cache and restart

```bash
# Stop the development server
# Clear Next.js cache
rm -rf .next

# Clear node_modules (optional)
rm -rf node_modules
npm install

# Restart the development server
npm run dev
```

### 6. Test Tailwind functionality

Visit `/test-tailwind` to see if Tailwind is working:

```bash
# Navigate to
http://localhost:3000/test-tailwind
```

### 7. Check browser developer tools

1. Open browser developer tools (F12)
2. Check the Console tab for any errors
3. Check the Network tab to see if CSS files are loading
4. Check the Elements tab to see if Tailwind classes are present

### 8. Common issues and solutions

#### Issue: Classes not being purged
**Solution**: Make sure your content paths in `tailwind.config.js` are correct and include all your component files.

#### Issue: Custom colors not working
**Solution**: Verify that your custom colors are defined in the `tailwind.config.js` theme section.

#### Issue: Dark mode not working
**Solution**: Ensure dark mode is configured in `tailwind.config.js`:
```js
module.exports = {
  darkMode: 'class',
  // ... rest of config
};
```

#### Issue: Forms plugin not working
**Solution**: Make sure `@tailwindcss/forms` is installed and included in your `tailwind.config.js`:
```js
module.exports = {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 9. Force rebuild

If nothing else works, try a complete rebuild:

```bash
# Stop the server
# Clear everything
rm -rf .next
rm -rf node_modules
rm package-lock.json

# Reinstall everything
npm install

# Start fresh
npm run dev
```

### 10. Check for conflicting CSS

Make sure there are no conflicting CSS files or global styles that might override Tailwind.

### 11. Verify file structure

Ensure your file structure matches the content paths in your Tailwind config:

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── *.tsx
│   └── styles/
│       └── globals.css
├── tailwind.config.js
└── postcss.config.js
```

## Still having issues?

If you're still experiencing problems after following these steps:

1. Check the browser console for any JavaScript errors
2. Verify that all imports are working correctly
3. Make sure the development server is running on the correct port
4. Try a different browser to rule out browser-specific issues
5. Check if there are any TypeScript compilation errors

## Quick Fix Commands

```bash
# Quick restart
npm run dev

# Clear cache and restart
rm -rf .next && npm run dev

# Full reinstall
rm -rf node_modules package-lock.json && npm install && npm run dev
``` 