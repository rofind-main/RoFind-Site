import * as RobloxApi from './api.js';
import * as DiscordSubmissionHook from './hook/submissionHook.js'

const popup = document.querySelector(".popup");
const modal = document.querySelector(".popup-modal");
const gameSubmissionBtn = document.querySelector(".game_submission");
const cancelBtn = document.querySelector("#game_submission_cancel");
const checkPlaceBtn = document.querySelector("#checkplace");
const verifyUserBtn = document.querySelector("#sign_in_roblox");
const submitBtn = document.querySelector("#game_submission_submit");

const ui = {
    iconPreview: document.querySelector("#submissions_game_preview"),
    gameName: document.querySelector("#submissions_game_name"),
    gameAuthor: document.querySelector("#submissions_game_author"),
    placeId: document.querySelector(".submission_placeId"),
};

function setSubmitState(state) {
    if (state === 'loading') {
        modal.classList.add('is-loading');
        submitBtn.disabled = true;
        cancelBtn.disabled = true;
    } else {
        modal.classList.remove('is-loading');
        submitBtn.disabled = false;
        cancelBtn.disabled = false;
    }

    if (state === 'idle') {
        submitBtn.textContent = 'Submit Game';
    } else if (state === 'success') {
        submitBtn.disabled = true;
        submitBtn.textContent = '✅ Submitted!';
    } else if (state === 'error') {
        submitBtn.disabled = false;
        submitBtn.textContent = '❌ Failed, try again';
    }
}

function resetForm() {
    ui.iconPreview.src = "https://placehold.co/56?text=?";
    ui.gameName.textContent = "No game selected";
    ui.gameAuthor.textContent = "";
    ui.placeId.value = "";
    ui.placeId.style.removeProperty("border-color");
    checkPlaceBtn.disabled = false;
    checkPlaceBtn.classList.remove("checked");
    checkPlaceBtn.textContent = 'Check';
    setSubmitState('idle');
}

function openSubmissionForm() {
    resetForm();
    popup.style.display = "grid";
}

function closeSubmissionForm() {
    popup.style.display = "none";
}

async function checkPlaceId() {
    const id = ui.placeId.value;
    if (!id) return;

    checkPlaceBtn.disabled = true;
    checkPlaceBtn.textContent = '⏳';

    try {
        const universeId = await RobloxApi.getUniverseId(Number(id));
        const [gameDetails, thumbnail] = await Promise.all([
            RobloxApi.fetchGameDetails(Number(universeId)),
            RobloxApi.fetchThumbnail(Number(universeId)),
        ]);

        ui.iconPreview.src = thumbnail;
        ui.gameName.textContent = gameDetails.name;
        ui.gameAuthor.textContent = gameDetails.creator?.name ?? "";
        ui.placeId.style.removeProperty("border-color");

        checkPlaceBtn.classList.add("checked");
        checkPlaceBtn.textContent = '✅';
    } catch (err) {
        console.error("Place ID check failed ->", id, err);
        ui.iconPreview.src = "https://placehold.co/56?text=X";
        ui.gameName.textContent = "Place not found!"
        ui.placeId.style.borderColor = "red";
        checkPlaceBtn.disabled = false;
        checkPlaceBtn.textContent = 'Check';
    }
}

function verifyUser() {
    console.log("Verify user");
}

async function submitSubmission() {
    const placeId = ui.placeId.value;
    if (!placeId) {
        console.error('Error: Empty place ID');
        return;
    }

    if (!checkPlaceBtn.classList.contains('checked')) {
        console.error('Error: Place not verified');
        ui.placeId.style.borderColor = 'orange';
        return;
    }

    const gameName = ui.gameName.textContent;
    const gameAuthor = ui.gameAuthor.textContent;

    setSubmitState('loading');

    try {
        await DiscordSubmissionHook.sendToDiscord({
            title: 'New Game Submission',
            description: 'A new game has been submitted for review.',
            color: 0x262942,
            thumbnail: ui.iconPreview.src,
            placeId,
            gameName,
            fields: [
                { name: 'Game Name', value: gameName, inline: true },
                { name: 'Place ID', value: placeId, inline: true },
                { name: 'Author', value: gameAuthor, inline: false },
            ],
        });

        setSubmitState('success');
        console.log('Submitted successfully');

        setTimeout(() => {
            closeSubmissionForm();
        }, 1500);
    } catch (err) {
        console.error('Submission failed:', err);
        setSubmitState('error');

        setTimeout(() => {
            setSubmitState('idle');
        }, 3000);
    }
}

function cancelSubmission() {
    closeSubmissionForm();
}

gameSubmissionBtn?.addEventListener("click", openSubmissionForm);
cancelBtn?.addEventListener("click", cancelSubmission);
checkPlaceBtn?.addEventListener("click", checkPlaceId);
verifyUserBtn?.addEventListener("click", verifyUser);
submitBtn?.addEventListener("click", submitSubmission);
ui.placeId.addEventListener('input', () => {
    if (checkPlaceBtn.classList.contains('checked')) {
        checkPlaceBtn.classList.remove('checked');
        checkPlaceBtn.disabled = false;
        checkPlaceBtn.textContent = 'Check';
        ui.iconPreview.src = "https://placehold.co/56?text=?";
        ui.gameName.textContent = "No game selected";
        ui.gameAuthor.textContent = "";
        ui.placeId.style.removeProperty("border-color");
    }
});