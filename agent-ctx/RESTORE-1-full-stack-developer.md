# RESTORE-1 - Full Stack Developer Work Record

## Task
Restore all 12 missing features that were lost due to project revert

## Work Log

### Backend APIs (10 routes)
1. **Created `/api/settings/wallpaper/route.ts`** - GET (public) returns `{wallpaperUrl}`, PUT (admin) saves wallpaper, DELETE (admin) clears wallpaper
2. **Created `/api/settings/customer-service/route.ts`** - GET (public) returns `{link}`, PUT (admin) saves CS link
3. **Created `/api/settings/messages/route.ts`** - GET (public) returns `{messages: []}`, PUT (admin) replaces all messages stored as JSON in `adminMessages` key
4. **Created `/api/settings/events/route.ts`** - GET (public) returns `{eventSettings: Record<string,{img?,aktivasi?}>}`, PUT (admin) saves event banner settings using keys `event_<eventId>_img` and `event_<eventId>_aktivasi`
5. **Created `/api/admin/users/[id]/role/route.ts`** - POST (admin) changes user role with prevention against self-demotion
6. **Created `/api/auth/change-password/route.ts`** - POST (authenticated) verifies old password and updates new password (with min 6 char validation, no same-as-old)
7. **Created `/api/upgrade/auto-complete/route.ts`** - POST (authenticated, owner-only) auto-approves upgrade, increments balance, creates credit transaction - all in a single Prisma transaction
8. **Updated `/api/settings/beranda/route.ts`** - GET/PUT now handle `logoUrl` field (stored in AppSetting key `logoUrl`)
9. **Created `/api/admin/promos/route.ts`** - POST (create), PUT (update by id in body), DELETE (by id query param) - all admin-only
10. **Updated `/api/auth/register/route.ts`** - Now accepts `role` param; only admin token + role==='admin' creates admin account; otherwise always 'user'

### Frontend Changes (src/app/page.tsx, 2839 -> 3554 lines)

#### State Variables (added)
- wallpaperUrl, showWallpaperForm, wallpaperInput, loadingWallpaper
- csLink, csLinkInput, loadingCs
- adminMessages, newMessage, loadingMessages
- logoUrl
- eventSettings, showEventManager, loadingEvent, editingEventId
- showRoleManager, loadingRole, regRole
- passwordForm, loadingPassword
- upgradeSuccess
- showPromoManager, promoForm, loadingPromo, editingPromoId

#### Handlers (added)
- loadWallpaper, handleSaveWallpaper, handleDeleteWallpaper
- loadCsLink, handleSaveCsLink
- loadAdminMessages, handleAddMessage, handleDeleteMessage
- loadEventSettings, handleSaveEvent
- handleChangeRole
- handleChangePassword
- handleAddPromo, handleSavePromoEdit, handleDeletePromo

#### Other Frontend Updates
- `getBackgroundStyle('main'|'alt')` helper that uses wallpaperUrl with overlay if set; replaced ALL 17 hardcoded background styles via sed
- Heartbeat useEffect: added `Authorization: Bearer ${token}` header
- `handleUpgrade`: fixed to use `data.upgradeRequest.id` (was `data.request.id`)
- Countdown useEffect: when countdown===0, calls `/api/upgrade/auto-complete`, sets `upgradeSuccess=true`, toasts success, calls `fetchProfile()`
- EventDetailScreen: shows green success banner when `upgradeSuccess`, disables action buttons + coin input + buttons during countdown/success, button text changes to "✅ Berhasil" after success
- EventScreen: uses event settings for custom image (if starts with http) and aktivasi text
- 4 new admin buttons (pink/purple/teal/amber, all `/85` opacity):
  - Wallpaper (pink) - toggles showWallpaperForm
  - Promosi (purple) - toggles showPromoManager
  - Event (teal) - toggles showEventManager
  - Role (amber) - toggles showRoleManager
- 4 new inline admin managers added after Film manager:
  - **Wallpaper Manager**: wallpaper URL input + save + delete + logo URL input + save + CS link input + save + preview
  - **Promosi Manager**: add new promo (img + link) form + existing promos list with edit/delete
  - **Event Manager**: list all events with edit (aktivasi text + image URL)
  - **Role Manager**: list all users with "Jadikan Admin"/"Jadikan User" buttons (disabled for self)
- Registration form: added role selector (User/Admin buttons) before submit
- Profile menu:
  - Pesan: now calls `loadAdminMessages()` then navigates to profile-detail with title 'Pesan'
  - Layanan Pelanggan: opens csLink in new tab if set, else toasts info
  - Manajemen Kata Sandi: resets password form then navigates
- ProfileDetailScreen: handles 3 cases:
  - 'Akun Saya': shows full profile (existing)
  - 'Pesan': shows messages list + admin-only textarea for new message
  - 'Manajemen Kata Sandi': shows password change form (old + new + confirm)
- AuthScreen: if logoUrl set (http), show custom logo image; else show default MILES planet
- Header: if logoUrl set (http), show custom logo image; else show default "M" circle
- Screen change useEffect: calls `loadWallpaper()` + `loadBerandaSettings()` on every screen change so background updates everywhere
- Admin screen useEffect: also calls `loadCsLink()`
- Profile screen useEffect: also calls `loadCsLink()`
- Event screen useEffect: also calls `loadEventSettings()` and resets `upgradeSuccess`
- `handleSaveTrailerUrl`: also saves `logoUrl`

## Verification
- `bun run lint`: **0 errors, 0 warnings**
- `curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/`: **HTTP 200**
- Dev log: only EADDRINUSE error from second dev server start attempt (expected, daemon already running)
- All API endpoints tested end-to-end with curl:
  - GET /api/settings/wallpaper -> 200 {wallpaperUrl:""}
  - GET /api/settings/customer-service -> 200 {link:""}
  - GET /api/settings/messages -> 200 {messages:[]}
  - GET /api/settings/events -> 200 {eventSettings:{}}
  - GET /api/settings/beranda -> 200 (includes logoUrl)
  - PUT /api/settings/wallpaper (admin) -> 200 success
  - PUT /api/settings/messages (admin) -> 200 success
  - PUT /api/settings/customer-service (admin) -> 200 success
  - PUT /api/settings/events (admin) -> 200 success
  - PUT /api/settings/beranda (admin) with logoUrl -> 200 success
  - POST /api/auth/change-password (wrong old) -> 400 "Kata sandi lama tidak sesuai"
  - POST /api/auth/change-password (same as old) -> 400 "tidak boleh sama"
  - POST /api/admin/promos (admin) -> 201 created
  - DELETE /api/admin/promos?id=X (admin) -> 200 deleted
  - POST /api/auth/register (admin token, role=admin) -> 201 with role:"admin"
  - POST /api/auth/register (no token, role=admin) -> 201 with role:"user" (security check passed)
  - POST /api/admin/users/[id]/role (self-demotion) -> 400 "Anda tidak dapat mengubah role akun Anda sendiri"
  - POST /api/admin/users/[id]/role (valid) -> 200 success
  - POST /api/admin/users/[id]/role (invalid role) -> 400 "Role tidak valid"
  - POST /api/upgrade -> 201 created
  - POST /api/upgrade/auto-complete (owner) -> 200 success, balance increased by 500,000 (1.5M -> 2M)
  - POST /api/upgrade/auto-complete (already processed) -> 400 "Permintaan sudah diproses"
  - POST /api/upgrade/auto-complete (no auth) -> 401 Unauthorized
- Test data cleaned up after verification

## Stage Summary
- All 10 backend API routes created/updated successfully and verified end-to-end
- All 12 frontend feature areas implemented in page.tsx (2839 -> 3554 lines, +715 lines)
- Lint passes with 0 errors
- App responds with HTTP 200
- No real errors in dev.log
- Security checks verified: admin role escalation prevented (non-admin cannot create admin), self-demotion prevented, password validation works, upgrade auto-complete is idempotent and owner-only
