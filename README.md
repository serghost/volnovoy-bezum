# Волновой безум: сайт и приложения

## Что внутри
- `www/` — игра (`index.html`), шрифты, иконки, файл для установки с сайта.
- `assets/` — исходники иконки и заставки, из них генерируются все размеры.
- `store/privacy.html` — политика конфиденциальности (нужна обоим магазинам).
- `store/listing.md` — тексты для страниц в магазинах.
- `package.json`, `capacitor.config.json` — настройки сборки.
- `CLAUDE.md` — инструкция для Claude Code.

## Путь 1. Сайт и иконка на iPad (15 минут, бесплатно)
1. GitHub → New repository (public) → Upload files: всё содержимое папки `www/`, плюс `store/privacy.html`.
2. Settings → Pages → Branch `main`, папка `/ (root)` → Save. Через минуту появится адрес вида `https://ИМЯ.github.io/РЕПОЗИТОРИЙ/`.
3. На iPad открыть адрес в Safari → «Поделиться» → «На экран Домой».

Игра запускается на весь экран. Сохранения и звук работают, потому что игра больше не встроена в страницу Claude. Облачной синхронизации там нет, прогресс хранится на самом iPad. Адрес `privacy.html` пригодится для магазинов.

## Путь 2. App Store и Google Play
Нужно: Mac с последним Xcode, Android Studio, Node.js 22+, аккаунты Apple Developer ($99 в год) и Google Play Console ($25 один раз).

Проще всего через Claude Code:
```
cd volnovoy-bezum
claude
```
и написать: «Прочитай CLAUDE.md, собери iOS-версию и запусти на симуляторе iPad». Потом так же для Android.

Вручную:
```
npm install
npx cap add ios
npx cap add android
npm run assets
npx cap sync
npx cap open ios        # Xcode: Signing → Team, затем Product → Archive
npx cap open android    # Android Studio: Build → Generate Signed App Bundle
```
После `cap add` нужны нативные правки (ориентация, полный экран, звук). Они расписаны в `CLAUDE.md`.

### Важно заранее
- `appId` в `capacitor.config.json` (сейчас `am.volnovoy.bezum`) после первой загрузки в магазин поменять нельзя. Если нужен другой, поменяй до `npx cap add`.
- Google Play: новый личный аккаунт сначала проходит закрытое тестирование, минимум 12 тестировщиков 14 дней подряд. Запусти его, как только будет первая сборка.
- Ключ подписи Android храни в надёжном месте: без него обновление не выпустить.

## Как обновлять игру
Правишь `www/index.html` → `npx cap sync` → новая сборка с увеличенной версией (iOS: Version/Build в Xcode; Android: `versionCode`/`versionName`).
