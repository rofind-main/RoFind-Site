const STAR_FILLED = './assets/star_filled.svg';
const STAR_BLANK = './assets/star_blank.svg';

function renderStars(rating, starSize, { max = 5, gap = 4 } = {}) {
  const stars = Array.from({ length: max }, (_, i) => {
    const fill = Math.min(1, Math.max(0, rating - i));

    if (fill >= 1) return `<img src="${STAR_FILLED}" width="${starSize}" height="${starSize}" draggable="false">`;
    if (fill <= 0) return `<img src="${STAR_BLANK}" width="${starSize}" height="${starSize}" draggable="false">`;

    return `
      <div style="position:relative; width:${starSize}px; height:${starSize}px; flex-shrink:0;">
        <img src="${STAR_BLANK}" width="${starSize}" height="${starSize}" draggable="false">
        <img src="${STAR_FILLED}" width="${starSize}" height="${starSize}" draggable="false"
             style="position:absolute; top:0; left:0; clip-path:inset(0 ${((1 - fill) * 100).toFixed(1)}% 0 0);">
      </div>`;
  }).join('');

  return `<div class="star-rating" style="gap:${gap}px">${stars}<span class="star-label">${rating.toFixed(1)}</span></div>`;
}
export function createCard({
  name,
  description,
  placeId,
  imageUrl,
  author,
  rating = 0,
  verifiedIcon,
  playCount,
  verified
}) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.placeId = placeId;

  const starSize = 35;

  card.innerHTML = `
    <div class="card-header">
      <img src="${imageUrl}" alt="" class="card-img" draggable="false">
      ${renderStars(rating, starSize)}
    </div>
    <div class="card-content">
      <h3 class="card-title"></h3>
      <div class="author-info">
        <p class="card-author">
          <span class="card-author-name"></span>
          <img src="${verifiedIcon}" class="verified-badge" style="display:${verified ? 'inline-block' : 'none'}; height:15px;" draggable="false" />
        </p>
      </div>
      <p class="card-description"></p>
    </div>
  `;

  card.querySelector('.card-title').textContent = name;
  card.querySelector('.card-author-name').textContent = author;
  card.querySelector('.card-description').textContent = description;

  card.addEventListener('click', () => {
    const viewer = document.getElementById('view_game');
    viewer.querySelector('#game_thumbnail').src = imageUrl;
    viewer.querySelector('#game_title').textContent = name;
    viewer.querySelector('#author_link').textContent = author;
    viewer.querySelector("#play_count_value").textContent = playCount
    viewer.style.display = 'grid';
  });

  return card;
}