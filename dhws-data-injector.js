// dhws-data-injector.js
// Lightweight placeholder to avoid 404s when the original injector is not present.
// If you have a real dhws-data-injector, replace this file with the original.
(function () {
  if (window.__DHWS_DATA_INJECTOR_PLACEHOLDER) return;
  window.__DHWS_DATA_INJECTOR_PLACEHOLDER = true;
  // expose a small API that real injector might provide (no-ops)
  window.DHWS = window.DHWS || {};
  window.DHWS.getData = window.DHWS.getData || function () {
    return Promise.resolve({});
  };
  console.info('dhws-data-injector placeholder loaded');
})();
