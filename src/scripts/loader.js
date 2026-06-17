const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.style.cssText = `
  position: fixed;
  inset: 0;
  background: #31303b;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s ease;
`;
loadingScreen.innerHTML = `
  <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
    <img src="../images/Cropped_FullColor_White.png" style="width:250px">
    <p style="color:grey; margin:0;">Loading...</p>
  </div>
`;
document.body.prepend(loadingScreen);

window.addEventListener('load', () => {
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.remove(), 500);
  }, 1500);
});