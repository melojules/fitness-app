import { Platform } from 'react-native';

function ensureHeadLink(rel: string, href: string) {
  if (document.querySelector(`link[rel="${rel}"]`)) return;
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  document.head.appendChild(link);
}

function ensureMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export function registerPwa() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  document.title = 'Fitness App';
  ensureHeadLink('manifest', '/manifest.webmanifest');
  ensureHeadLink('apple-touch-icon', '/icon.png');
  ensureMeta('theme-color', '#0B0B0D');
  ensureMeta('apple-mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  ensureMeta('apple-mobile-web-app-title', 'Fitness');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // The app remains usable online if service-worker registration is unavailable.
      });
    });
  }
}
