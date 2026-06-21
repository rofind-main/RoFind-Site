let currentRating = 0;

export function initStars() {
    const holder = document.querySelector('#stars_holder');
    if (!holder) return;

    const stars = holder.querySelectorAll('.star');
    if (!stars.length) return;

    // Clone all stars to remove old listeners
    stars.forEach(star => {
        const clone = star.cloneNode(true);
        star.parentNode.replaceChild(clone, star);
    });

    const freshStars = holder.querySelectorAll('.star');

    freshStars.forEach(star => {
        const value = parseInt(star.querySelector('img')?.dataset.value);
        if (!value) return;

        star.addEventListener('mouseenter', () => {
            freshStars.forEach(s => {
                const v = parseInt(s.querySelector('img')?.dataset.value);
                s.classList.remove('selected');
                s.classList.toggle('hovered', v <= value);
            });
        });

        star.addEventListener('click', () => {
            currentRating = value;
            freshStars.forEach(s => {
                const v = parseInt(s.querySelector('img')?.dataset.value);
                s.classList.remove('hovered');
                s.classList.toggle('selected', v <= value);
            });
        });
    });

    holder.addEventListener('mouseleave', () => {
        freshStars.forEach(s => {
            s.classList.remove('hovered');
            const v = parseInt(s.querySelector('img')?.dataset.value);
            s.classList.toggle('selected', v <= currentRating);
        });
    });
}

export function getRating() {
    return currentRating;
}

export function resetRating() {
    currentRating = 0;
    document.querySelectorAll('#stars_holder .star').forEach(s => {
        s.classList.remove('selected', 'hovered');
    });
}

// Submit wiring — runs once on load
document.querySelector('#submit_stars')?.addEventListener('click', () => {
    if (!currentRating) {
        console.warn('No rating selected');
        return;
    }

    console.log('Rating submitted:', currentRating);
    // TODO: send to API with placeId

    document.getElementById('rate_game').style.display = 'none';
    resetRating();
});