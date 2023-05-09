const API_TOKEN = 'ATATT3xFfGF0Yzqwwqwp57p7Zc_XJzLIoXsiv_hntn3JPF86Ftwvt1TeK9npsWYqk1bEmGOFAqjIy9JD9GtNV7d5bNgqJf2pu9geqGqxKArpu67hr4K2Vl68VQimqyjWuvdtK466VqKOdyYkV_2n8jLwhp6kH_L05uvL73iCZepDVmVLO2vwFDY=DA1F88B5';
const USER_EMAIL = 'rajiv.kulkarni@zocdoc.com';

const AUTH_HEADER = {
    'Authorization': `Basic ${btoa(`${USER_EMAIL}:${API_TOKEN}`)}`,
    'Content-Type': 'application/json',
};

async function startJiraTicket(issueKey) {
    const url = `https://zocdoc.atlassian.net/rest/api/3/issue/${issueKey}/transitions`;
    const response = await fetch(url, {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({
            "transition": {
                "id": "51"
            }
        }),
    });

    if (!response.ok) {
        console.error(`Failed to start Jira ticket ${issueKey}: ${response.statusText}`);
    }
}

async function resolveJiraTicket(issueKey) {
    const url = `https://zocdoc.atlassian.net/rest/api/3/issue/${issueKey}/transitions`;
    const response = await fetch(url, {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({
            transition: {
                id: '21', // Replace with the ID of the "Resolve Issue" transition in your Jira project
            },
        }),
    });

    if (!response.ok) {
        console.error(`Failed to resolve Jira ticket ${issueKey}: ${response.statusText}`);
    }
}

async function fetchTickets() {
    const url = 'https://zocdoc.atlassian.net/rest/servicedeskapi/servicedesk/TOSD/queue/347/issue?start=0&limit=100';
    const response = await fetch(url, { method: 'GET', headers: { ...AUTH_HEADER, Accept: 'application/json' } });

    if (!response.ok) {
        console.error(`Failed to fetch tickets: ${response.statusText}`);
        return [];
    }

    const data = await response.json();
    const filteredIssues = data.values.filter(issue => {
        const summary = issue.fields.summary;
        const assignee = issue.fields.assignee;
        return (
            assignee === null &&
            (summary.startsWith('[EpicWebServices:') || summary.startsWith('[CAPI_GrowTherapy:') || summary.startsWith('[CernerMilleniumAPI:'))
        );
    });

    return filteredIssues.map(issue => ({
        issueKey: issue.key,
        title: issue.fields.summary,
        assignee: issue.fields.assignee,
    }));
}

console.log(filteredIssues);

export { startJiraTicket, resolveJiraTicket, fetchTickets };


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