# «Волновой безум»: обёртка Capacitor для iOS и Android

## Контекст
- Игра целиком в `www/index.html` (canvas, без бандлера и фреймворков). Не переписывай и не разбивай этот файл без прямой просьбы. Правки игры делай только в нём, потом `npx cap sync`.
- Сохранения: localStorage + копия в плагине `@capacitor/preferences` (в коде уже есть `IS_NATIVE`, `NPREF`, `nativeLoad`). Облако Claude в приложении не используется, значок статуса сохранения в меню скрыт.
- Звук: Web Audio, включается по первому касанию. Шрифты локальные (`www/fonts`, лицензия OFL).
- Цели: только горизонтальная ориентация, полный экран без статус-бара, звук играет и в беззвучном режиме iOS, не глуша музыку других приложений.
- Офлайн для сайта: `www/sw.js` (service worker, в приложениях из магазинов не регистрируется). Новые файлы в `www/` добавляй в `ASSETS` в `sw.js` и поднимай версию `CACHE`; правки `index.html` подтягиваются сами при следующем запуске с интернетом.
- Capacitor 8, нужен Node 22+.

## Первичная настройка
1. `node -v` (22+), `npm install`.
2. Если нужен другой bundle id, поменяй `appId` в `capacitor.config.json` ДО следующего шага (после первой загрузки в магазин он меняться не может).
3. `npx cap add ios` и `npx cap add android`.
4. `npm run assets`: иконки и заставки из `assets/`.
5. Внеси «Нативные правки» ниже.
6. `npx cap sync`.

## Нативные правки (после `cap add`)
### iOS (`ios/App/App`)
- `Info.plist`:
  - `UISupportedInterfaceOrientations` и `UISupportedInterfaceOrientations~ipad`: только `UIInterfaceOrientationLandscapeLeft` и `UIInterfaceOrientationLandscapeRight`.
  - `UIRequiresFullScreen` = YES (иначе на iPad ориентация не фиксируется и включается Split View).
  - `UIStatusBarHidden` = YES, `UIViewControllerBasedStatusBarAppearance` = NO.
  - `ITSAppUsesNonExemptEncryption` = NO (шифрования нет, вопрос про экспорт не появится).
- `AppDelegate.swift`: `import AVFoundation`, а в `application(_:didFinishLaunchingWithOptions:)` перед `return`:
  ```swift
  try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
  try? AVAudioSession.sharedInstance().setActive(true)
  ```
- Display Name: «Волновой безум». Version 1.0.0, Build 1.

### Android (`android/app`)
- `AndroidManifest.xml`, у `MainActivity`: `android:screenOrientation="sensorLandscape"`.
- Полный экран: в `MainActivity` спрятать системные панели:
  ```java
  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
      super.onWindowFocusChanged(hasFocus);
      if (hasFocus) {
          WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
          c.hide(WindowInsetsCompat.Type.systemBars());
          c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      }
  }
  ```
  (импорты из `androidx.core.view`). Если MainActivity на Kotlin, то же самое на Kotlin.
- `versionCode` 1, `versionName` "1.0.0" в `android/app/build.gradle`.

## Проверка перед релизом
- Симулятор iPad и, по возможности, реальный iPad: горизонталь, полный экран, звук (включая беззвучный режим), тап/удержание/свайп вниз, пауза при сворачивании.
- Сохранение: сыграть, купить что-нибудь, полностью закрыть приложение смахиванием, открыть снова. Прогресс должен остаться.
- Android: то же на эмуляторе планшета.
- Скриншоты для магазинов: `xcrun simctl io booted screenshot file.png` на iPad 13" и iPhone 6.9", горизонтально.

## Релиз
- iOS: Xcode → Signing & Capabilities → Team. Product → Archive → Distribute App → App Store Connect. Сначала TestFlight: так игру можно поставить на iPad ребёнка ещё до ревью.
- Android: создай upload keystore (файл и пароли храни вне репозитория, без них не выпустить обновление), затем Build → Generate Signed App Bundle (.aab). Play Console → закрытое тестирование: минимум 12 тестировщиков 14 дней подряд, потом запрос доступа к продакшену.
- Политику `store/privacy.html` выложи на публичный адрес (например GitHub Pages), впиши email вместо `ВАШ_EMAIL`, укажи URL в обоих магазинах.
- Тексты страниц: `store/listing.md`.

## Не делать
- Не добавлять аналитику, рекламу, трекинг и сторонние SDK: игра для ребёнка, в магазинах заявлено «данные не собираются».
- Не коммитить ключи подписи и пароли.
