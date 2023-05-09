(async () => {
    // Import the JIRA API functions from jiraApi.js
    const { startJiraTicket, resolveJiraTicket, fetchTickets } = await import('../lib/jiraApi.js');

    // Constants
    const JIRA_QUEUE_URL = "https://zocdoc.atlassian.net/jira/servicedesk/projects/TOSD/queues/custom/347";
    const TITLE_PREFIXES = ["[EpicWebServices:", "[CAPI_GrowTherapy:", "[CernerMilleniumAPI:"];

    // Helper function to wait for a certain amount of time (ms)
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Function to get the required URL from the ticket description
    function getURLFromDescription(description) {
        const urlMatch = description.match(/https:\/\/zocdoc\.com\/mlt\/u\?t=[^ \n]+/);
        return urlMatch ? urlMatch[0] : null;
    }

    // Function to extract the professional ID from the transformed URL
    async function getProfessionalIDFromTransformedURL(url) {
        // ...
        const response = await fetch(url, { method: "GET", mode: "no-cors" });
        const responseURL = response.url;
        const professionalIDMatch = responseURL.match(/professionalId\/(\d+)/);
        return professionalIDMatch ? professionalIDMatch[1] : null;
    }

    // Function to remove the lock for a given professional ID
    async function removeLock(professionalID) {
        // Open the internal tooling page
        window.location.href = "https://pulse.zocdoc.com/csr/SyncLock";

        // Wait for the page to load
        await wait(5000);

        // Find the Remove Lock link with the matching profid
        const removeLockLinks = Array.from(document.querySelectorAll(".deleteLock"));
        const targetLink = removeLockLinks.find(link => link.getAttribute("profid") == professionalID);

        if (!targetLink) {
            console.error(`No Remove Lock link found for professional ID ${professionalID}`);
            return;
        }

        // Click the Remove Lock link and wait for the confirmation popup
        targetLink.click();
        await wait(1000);

        // Override the window.confirm function to return true (simulates clicking "OK")
        window.confirm = () => true;

        // Wait for the lock removal to complete
        await wait(2000);
    }

    // Function to process a single ticket
    async function processTicket(ticket) {
        await startJiraTicket(ticket.issueKey);

        const url = getURLFromDescription(ticket.description);
        if (!url) {
            console.error(`No URL found in the description for ticket ${ticket.issueKey}`);
            return;
        }
        const professionalID = await getProfessionalIDFromTransformedURL(url);
        if (!professionalID) {
            console.error(`No professional ID found in the transformed URL for ticket ${ticket.issueKey}`);
            return;
        }

        await removeLock(professionalID);
        await resolveJiraTicket(ticket.issueKey);
    }

    // Function to log ticket processing information
    function logTicketProcessing(count) {
        const timestamp = new Date();
        const logEntry = `[${timestamp.toISOString()}] Processed ${count} tickets\n`;
        console.log(logEntry);
    }

    // Function to handle logging in if not already logged in
    async function handleLogin() {
        const isLoggedIn = document.querySelector('.csr-nav-item.csr-nav-user-name');
        if (!isLoggedIn) {
            const loginButton = document.querySelector('button[data-test="sign-in-form-submit"]');
            if (loginButton) {
                loginButton.click();
                await wait(5000); // Wait for the login page to load

                // Click the login button directly if email and password are already saved
                const submitButton = document.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.click();
                    await wait(5000); // Wait for the login to complete
                }
            }
        }
    }



    // Main function to process the tickets
    async function main() {

        await handleLogin();

        const TEST_MODE = true;

        window.location.href = JIRA_QUEUE_URL;
        await wait(5000);

        let actionableTickets;

        if (TEST_MODE) {
            actionableTickets = [
                {
                    issueKey: "TOSD-198077",
                    title: "[EpicWebServices:SyncDatabaseId: 35239] Professional Locked - Amber Freeman, APRN - Orlando Health Physician Associates",
                    assignee: null
                },
            ];
        } else {
            const tickets = await fetchTickets();
            actionableTickets = tickets.filter((ticket) => {
                const isUnassigned = !ticket.assignee;
                const hasMatchingTitle = TITLE_PREFIXES.some((prefix) => ticket.title.startsWith(prefix));
                return isUnassigned && hasMatchingTitle;
            });
        }

        for (const ticket of actionableTickets) {
            await processTicket(ticket);
            if (TEST_MODE) {
                break;
            }
        }

        logTicketProcessing(actionableTickets.length);
    }
    // Run the main function
    main();
})();



// Sample response
// 0: {…}
// issueKey: "TOSD-198077"
// title: "[EpicWebServices:SyncDatabaseId: 35239] Professional Locked - Amber Freeman, APRN - Orlando Health Physician Associates"
// assignee: null
// 1: {…}
// issueKey: "TOSD-198078"
// title: "[CernerMillenniumAPI:SyncDatabaseId: 28283] Professional Locked - Gayathri Mohanachandran Pillai Geetha Devi, MD - BayCare Medical Group"
// assignee: null
// 2: {…}
// issueKey: "TOSD-198090"
// title: "[EpicWebServices:SyncDatabaseId: 25961] Professional Locked - Emily Greene Anderson, PA - SCL Health Medical Group - Lowry"
// assignee: null
// 3: {…}
// issueKey: "TOSD-198093"
// title: "[CAPI_GrowTherapy:SyncDatabaseId: 32149] Professional Locked - Nicole Albert, LPC - Grow Therapy - Georgia"
// assignee: null
// 4: {…}
// issueKey: "TOSD-198100"
// title: "[EpicWebServices:SyncDatabaseId: 35239] Professional Locked - Amber Freeman, APRN - Orlando Health Physician Associates"
// assignee: null
// 5: {…}
// issueKey: "TOSD-198103"
// title: "[EpicWebServices:SyncDatabaseId: 25961] Professional Locked - Margaret 'Maggie' Saccomano, MD - SCL Health Medical Group - Lowry"
// assignee: null