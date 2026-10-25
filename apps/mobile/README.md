# Lockmate mobile

The main product (PLAN §3): Expo SDK 58, React Native, Expo Router and TanStack Query.

## Run it

```bash
cp .env.example .env                    # the API at http://localhost:8000/api/v1
cd ../api && php artisan serve          # in another terminal: iOS only allows plain HTTP to local hosts
pnpm --filter @lockmate/mobile ios      # builds the app and opens it in the iOS simulator
pnpm --filter @lockmate/mobile android  # same on an Android emulator
```

`ios` and `android` build the app natively (`expo run`), so the real icon, splash screen, per-app language and RTL settings apply. That needs Xcode with an iOS simulator and CocoaPods, or the Android SDK. `ios/` and `android/` are generated from `app.json` on every build and are not committed. After adding a native module, regenerate them with `npx expo prebuild --clean`.

Herd's `lockmate-api.test` works from a browser but not from the app: iOS blocks plain HTTP to anything but local hosts. On a real phone, run `php artisan serve --host 0.0.0.0` and point `EXPO_PUBLIC_API_URL` at your Mac's LAN IP. The Android emulator reaches the Mac at `10.0.2.2`.

## Accounts

- `src/features/auth/session.tsx`: the device token, kept in `expo-secure-store` (Keychain / Keystore, ADR 0004). `ready` stays false until it's been read, and the splash screen waits for it.
- `src/app/_layout.tsx`: `Stack.Protected` route guards. With a token you get the `(app)` screens; without one you get `sign-in` and `sign-up`.
- `src/api.tsx`: every request sends the token. A 401 for a request that had one signs the app out, because the token expired or was revoked.
- Signing out revokes the token on the server, then forgets it here, even when offline. Cached data is cleared whenever the person changes.
- Errors are shown in the app's language. The API's own messages are English only, so they're mapped by field and status (`authErrors.ts`). Sign-in never says which part was wrong.

## Icon and splash

`pnpm brand-assets` renders `assets/*.png` from the brand SVGs in `@lockmate/tokens/logos`. Run it whenever the logos change, and commit the PNGs.

- **iOS icon:** the app icon, square (iOS rounds the corners).
- **Android adaptive icon:** the leaves on transparency over forest (`adaptiveIcon.backgroundColor`), scaled to stay inside the launcher's mask. Android 13+ themed icons get a single-colour version with the midrib cut out.
- **Splash:** the symbol on dew, or the reversed symbol on the dark background in dark mode. It stays up until Rubik has loaded and the saved session has been read.

A test fails if the colours in `app.json` drift from the tokens.

On the iOS 27 simulator, the first moment of the splash shows the leaves in more saturated greens before they settle on the brand colours. That's iOS's cached launch snapshot, not the PNGs: it stores our sRGB values but labels the image Display P3. Every screen the app draws, including its own copy of the splash, is exact. Check it on a real phone before working around it.

## How it's put together

- `src/app/`: routes only (Expo Router). `_layout.tsx` loads Rubik, then provides the language, the query client, the session and the API client.
- `src/features/<feature>/`: one folder per feature (RULES §8). A screen's data hook stays apart from its view, so views are tested without the network.
- `src/ui/`: shared primitives (`Screen`, `Card`, `Text`, `Button`, `TextField`) built only from `@lockmate/tokens`. Never use raw colours or sizes.
- `src/api.tsx`: `useApi().query.useQuery('get', '/status')`, typed from the API spec (`@lockmate/api-client`).
- `src/locale.tsx`: the language. It comes from the phone, English by default; people switch it in system Settings (per-app language), which restarts the app. All strings come from `@lockmate/i18n`.

## Arabic and RTL

- Native layout mirrors for Arabic (`supportsRTL`). Use `start`/`end`, never `left`/`right`: ESLint rejects physical sides in styles.
- `Text` drops letter-spacing in Arabic, because tracking breaks the joins between letters.
- Each Rubik weight is loaded as its own family (`Rubik_500Medium`…), because Android can't pick weights within one family. Only the three weights the tokens use are bundled.

## Checks

`pnpm lint` (ESLint + Prettier), `pnpm typecheck`, `pnpm test` (Jest with React Native Testing Library) and `pnpm build` (bundles iOS and Android with `expo export`).
