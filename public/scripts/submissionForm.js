import * as RobloxApi from './api.js';
import * as DiscordSubmissionHook from './hook/submissionHook.js'

const popup = document.querySelector(".popup");
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

function resetForm() {
    ui.iconPreview.src = "https://placehold.co/56?text=?";
    ui.gameName.textContent = "No game selected";
    ui.gameAuthor.textContent = "";
    ui.placeId.value = "";
    ui.placeId.style.removeProperty("border-color");
    checkPlaceBtn.disabled = false;
    checkPlaceBtn.classList.remove("checked");
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

    try {
        console.log(id)
        const universeId = await RobloxApi.getUniverseId(Number(id));
        const [gameDetails, thumbnail] = await Promise.all([
            RobloxApi.fetchGameDetails(Number(universeId)),
            RobloxApi.fetchThumbnail(Number(universeId)),
        ]);

        ui.iconPreview.src = thumbnail;
        ui.gameName.textContent = gameDetails.name;
        ui.gameAuthor.textContent = gameDetails.creator?.name ?? "";
        ui.placeId.style.removeProperty("border-color");

        checkPlaceBtn.disabled = true;
        checkPlaceBtn.classList.add("checked");
    } catch (err) {
        console.error("Place ID check failed ->", id, err);
        ui.placeId.style.borderColor = "red";
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
        return;
    }

    const gameName = ui.gameName.textContent;
    const gameAuthor = ui.gameAuthor.textContent;

    try {
        await DiscordSubmissionHook.sendToDiscord({
            title: 'New Game Submission',
            description: 'A new game has been submitted for review.',
            color: 0x262942,
            thumbnail: ui.iconPreview.src,
            placeId,
            fields: [
                { name: 'Game Name', value: gameName, inline: true },
                { name: 'Place ID', value: placeId, inline: true },
                { name: 'Author', value: gameAuthor, inline: false },
            ]
        });
        console.log('Submitted successfully');
        closeSubmissionForm();
    } catch (err) {
        console.error('Submission failed:', err);
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