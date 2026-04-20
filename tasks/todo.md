# Finalization Plan: Ewé Axé

## Overview
Transform the current working prototype into a production-ready Web Application, adhering to the final required steps (PWA installation, Legal compliance, and First-time Onboarding).

## Tasks
- [x] 1. **PWA Integration (Installable & Offline Support)**
  - Install `vite-plugin-pwa`.
  - Configure `vite.config.ts` with the PWA manifest (name, colors, generate standard icons from lucide or placeholders).
  - Implement service worker registration so the app can be installed on Android/iOS home screens.
- [x]  2. **Legal & Compliance (LGPD/Terms)**
  - Create a "Termos de Uso e Privacidade" text/modal.
  - Add a mandatory checkbox to the AuthProvider / Login screen requiring consent before entering the app.
- [x] 3. **First-Time Onboarding Experience**
  - Create a brief tutorial overlay/screen (e.g., explaining the Oráculo, Congá and Acervo).
  - Track `hasSeenOnboarding` in `localStorage` so it only shows once.

## Review Section
*(To be populated after execution)*
