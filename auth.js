import { CONFIG } from './config.js';

let tokenClient = null; 

const SHEETS_READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'; 

function getLoginButton() {
    return document.getElementById("google-login-button");
}

function getLoginStatus() {
    return document.getElementById("login-status");
}

function setLoginStatus(message, isError = false) {
    const status = getLoginStatus();

    status.textContent = message;
    status.classList.toggle("error-message", isError);
}

function waitForGoogleLibrary() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        initializeGoogleAuth();
        return;
    }

    setTimeout(waitForGoogleLibrary, 100);
}

function initializeGoogleAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        scope: SHEETS_READONLY_SCOPE,
        callback: handleTokenResponse,
        error_callback: handlePopupError
    });

    const loginButton = getLoginButton();

    loginButton.disabled = false;
    loginButton.addEventListener(
        "click",
        requestGoogleAccess
    );

    setLoginStatus("Ready to Sign in.");
}

function requestGoogleAccess() {
    if (!tokenClient) {
        setLoginStatus("Google Sign-In is not ready yet.", true);
        return;
    }

    setLoginStatus("Opening Google account selection...");

    tokenClient.requestAccessToken({
        prompt: "select_account"
    });
}

function handleTokenResponse(response) {
    if (response.error) {
        setLoginStatus(`Google authorization failed: ${response.error}`, true);
        return;
    }

    if (!response.access_token) {
        setLoginStatus("Google did not return an access token.", true);
        return;
    }

    setLoginStatus("Login successful.");

    document.dispatchEvent(
        new CustomEvent("google-auth-success", {
            detail: {
                accessToken: response.access_token
            }
        })
    );
}

function handlePopupError(error) {
    let message = "Unable to open Google Sign-In."; 

    if (error.type === "popup_closed") {
        message = "The Google Sign-In window was closed."; 
    } 

    if (error.type === "popup_blocked") {
        message = "The browser blocked the Google Sign-In popup window.";
    }

    setLoginStatus(message, true);
}

waitForGoogleLibrary();