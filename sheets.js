import { CONFIG } from "./config.js"; 

document.addEventListener(
    "google-auth-success", 
    async function (event) {
        const accessToken = event.detail.accessToken;

        // Use token to fetch data from sheets 
        try {
            showStatus("Retrieving data from Google Sheets...");

            const people = await loadSheetData(accessToken);

            showStatus(`${people.length} records loaded successfully.`);

            document.dispatchEvent(
                new CustomEvent("sheet-data-loaded", {
                    detail: {
                        people: people
                    }
                })
            );
        } catch (error) {
            console.error("Google Sheets error: ", error); 

            showStatus(error.message, true);
        }
    }
); 

async function loadSheetData(accessToken) {
    const range = `${CONFIG.SHEET_NAME}!${CONFIG.SHEET_RANGE}`;

    const encodedRange = encodeURIComponent(range);

    const url = "https://sheets.googleapis.com/v4/spreadsheets/" + 
                CONFIG.SPREADSHEET_ID + 
                "/values/" +
                encodedRange + 
                "?valueRenderOption=UNFORMATTED_VALUE";

    const response = await fetch(url, {
        // method: "GET", 

        headers: {
            Authorization: `Bearer ${accessToken}`, 

            // Accept: "application/json"
        }
    });


    // No successful response from sheets, throw error 
    if (!response.ok) {
        const errorData = await response.json();

        const message = errorData.error?.message || "Unable to retrieve data from Google Sheets."; 

        throw new Error(message); 
    }

    const data = await response.json();

    const rows = data.values || [];

    if (rows.length === 0) {
        throw new Error("No data was found in the Google Sheets.");
    }


    // Convert every row into object 
    const people = rows.map(
        function (row, index) {
            return {
                name: row[0] || "Unknown", 
                photo: row[1] || "", 
                age: Number(row[2]) || 0, 
                country: row[3] || "Unknown",
                interest: row[4] || "Not Specified",
                netWorth: parseNetWorth(row[5])
            }; 
        }
    );

    return people;
}


function parseNetWorth(value) {
    if (typeof value === "number") {
        return value; 
    }

    const cleanedValue = String(value || "").replace(/[$,\s]/g, "");

    const number = Number(cleanedValue);

    if (Number.isNaN(number)) {
        return 0; 
    }

    return number;
}

function showStatus(message, isError = false) {
    const status = document.getElementById("login-status");

    if (!status) {
        return; 
    }

    status.textContent = message; 

    status.classList.toggle("error-message", isError);
}