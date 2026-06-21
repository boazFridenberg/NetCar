/**
 * Vite configuration.
 *
 * The dev server proxies every `/api` request to the NetCar backend so the SPA
 * and API appear same-origin in the browser — this is what lets the httpOnly
 * refresh-token cookie flow work without any CORS friction. The proxy target is
 * configurable via VITE_API_PROXY_TARGET and defaults to port 3002.
 */
declare const _default: import("vite").UserConfigFnObject;
export default _default;
