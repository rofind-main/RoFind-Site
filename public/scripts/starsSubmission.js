let currentRating = 0;


export function initStars() {
    const holder = document.querySelector('#stars_holder');
    if (!holder) return;

    const stars = holder.querySelectorAll('.star');
    if (!stars.length) return;

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

document.querySelector('#submit_stars')?.addEventListener('click', async () => {
    if (!currentRating) {
        console.warn('No rating selected');
        return;
    }

    const placeId = document.getElementById('rate_game')?.dataset.placeId;
    if (!placeId) return;

    // Check if already rated
    const storageKey = `rated_${placeId}`;
    if (localStorage.getItem(storageKey)) {
        // alert('You have already rated this game.');
        document.getElementById("already_rated").style = "display: grid"
        return;
    }

    const submitBtn = document.querySelector('#submit_stars');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const res = await fetch('/api/rating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placeId, rating: currentRating }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || res.status);
        }

        const { avg, count } = await res.json();
        console.log(`Rating submitted! New avg: ${avg} from ${count} votes`);

        // Mark as rated
        localStorage.setItem(storageKey, '1');

        submitBtn.textContent = 'Rated!';
        setTimeout(() => {
            document.getElementById('rate_game').style.display = 'none';
            document.getElementById('already_rated').style.display = 'none';
            resetRating();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Rating';
        }, 1500);

    } catch (err) {
        console.error('Rating failed:', err);
        submitBtn.textContent = 'Failed, try again';
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Rating';
        }, 3000);
    }
});