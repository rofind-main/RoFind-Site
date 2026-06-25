// TODO: Account handler

export function getLoggedIn() {
    const loginToken = localStorage.getItem('login_token');

    if (!loginToken) {
        return 0;
    }

    return loginToken;
}

export function setLoggedIn(token) {
    localStorage.setItem('login_token', token);
}