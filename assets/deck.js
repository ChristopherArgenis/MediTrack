// MediTrack · navegación de presentaciones (← →, espacio, F, toque/clic, #n)
const slides = [...document.querySelectorAll('.s')];
slides.forEach((s, i) => {
  if (i === 0 || s.classList.contains('full')) return;
  s.insertAdjacentHTML('beforeend', `<span class="pg">${String(i+1).padStart(2,'0')} / ${slides.length}</span>${s.classList.contains('end') ? '' : '<span class="brandmark"><img src="assets/logo.svg" alt="">MediTrack</span>'}`);
});
let cur = Math.min(slides.length - 1, Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1));
function show(i){
  cur = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, k) => s.classList.toggle('on', k === cur));
  document.getElementById('cnt').textContent = `${cur+1} / ${slides.length}`;
  document.getElementById('bar').style.width = ((cur+1)/slides.length*100) + '%';
  history.replaceState(null, '', '#' + (cur+1));
}
function fit(){
  const v = document.getElementById('viewer');
  const k = Math.min(v.clientWidth / 1920, v.clientHeight / 1080);
  document.getElementById('deck').style.transform = `scale(${k})`;
}
addEventListener('resize', fit);
addEventListener('keydown', e => {
  if (['ArrowRight','PageDown',' '].includes(e.key)){ e.preventDefault(); show(cur+1); }
  if (['ArrowLeft','PageUp'].includes(e.key)){ e.preventDefault(); show(cur-1); }
  if (e.key === 'Home') show(0);
  if (e.key === 'End') show(slides.length-1);
  if (e.key === 'f' || e.key === 'F') toggleFs();
});
function toggleFs(){ document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); }
document.getElementById('prev').onclick = () => show(cur-1);
document.getElementById('next').onclick = () => show(cur+1);
document.getElementById('fs').onclick = toggleFs;
document.getElementById('viewer').addEventListener('click', e => { if (!e.target.closest('a,button')) show(cur + (e.clientX > innerWidth/2 ? 1 : -1)); });
let tx = null;
addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
addEventListener('touchend', e => { if (tx == null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 40) show(cur + (d < 0 ? 1 : -1)); tx = null; });
fit(); show(cur);
