import { getSubmittedGamesCount } from "./firebase";

const ui = {
    SumittedValue: document.getElementById('submitted_total_value'),
    RegisteredUsers: document.getElementById('registered_users_total'),
    RoFindStarred: document.getElementById('rofind_starred')
}

document.addEventListener('DOMContentLoaded', (e) => {
    console.log("Statistics")
    ui.getSubmittedGamesCount.textContent = getSubmittedGamesCount()
})