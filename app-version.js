(() => {
  const version = '8.0';
  self.APP_VERSION = version;

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const controller = navigator.serviceWorker.controller;
  const controllerVersion = controller ? new URL(controller.scriptURL).searchParams.get('v') : null;
  if (!controllerVersion || controllerVersion === version) return;

  // 旧HTMLを旧Service Workerが返した直後は、制御中の版を表示して食い違いを避ける。
  window.addEventListener('DOMContentLoaded', () => {
    const label = document.getElementById('appVersion');
    if (label) label.textContent = `v${controllerVersion}`;
  }, {once: true});

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  }, {once: true});

  // 古いHTML内の通常登録より先に最新版の更新確認を開始する。
  navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(version)}`, {updateViaCache: 'none'}).catch(() => {});
})();
