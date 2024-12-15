document.addEventListener('DOMContentLoaded', () => {
    fetchChatRecords();

    // Add event listener for filter selection
    const riskFilter = document.getElementById('riskFilter');
    riskFilter.addEventListener('change', fetchChatRecords);
    
    // Add event listener for user search
    const userSearchInput = document.getElementById('userSearch');
    userSearchInput.addEventListener('input', fetchChatRecords);
});

async function fetchChatRecords() {
    // Show the spinner while fetching data
    document.getElementById('spinner').style.display = 'block';
    const container = document.getElementById('chatRecords');
    container.innerHTML = ''; // Clear previous records

    try {
        const response = await fetch('/api/chat-records');
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Network response was not ok: ' + errorText);
        }
        
        const chatRecords = await response.json();

        // Get the selected risk from the dropdown filter
        const selectedRisk = document.getElementById('riskFilter').value;

        // Get the user search term
        const userSearchTerm = document.getElementById('userSearch').value.trim().toLowerCase();

        // Filter chat records based on selected risk score
        const filteredRecords = chatRecords.filter(record => {
            const matchesRisk = selectedRisk === 'ALL' || record.aggregate_risk_score === selectedRisk;
            const matchesUserId = userSearchTerm === '' || String(record.user_id).toLowerCase() === userSearchTerm;
            return matchesRisk && matchesUserId;
        });

        displayChatRecords(filteredRecords);
    } catch (error) {
        displayErrorMessage(error.message);
    } finally {
        // Hide the spinner once the data has been processed
        document.getElementById('spinner').style.display = 'none';
    }
}

function displayErrorMessage(message) {
    const container = document.getElementById('chatRecords');
    container.innerHTML = `
        <div class="no-records">
            <h2>Error Fetching Records</h2>
            <p>${message}</p>
        </div>
    `;
}

function displayChatRecords(chatRecords) {
    const container = document.getElementById('chatRecords');
    container.innerHTML = ''; // Clear previous content

    if (!chatRecords || chatRecords.length === 0) {
        container.innerHTML = '<div class="no-records">No chat records found.</div>';
        return;
    }

    chatRecords.forEach((record, index) => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'chat-session';

        // Parse the provided timestamp format
        const createdAt = new Date(record.created_at).toLocaleString();

        // Create session header with user_id and risk_score
        const headerDiv = document.createElement('div');
        headerDiv.className = 'session-header';
        headerDiv.innerHTML = `
            <h3>User ${record.user_id}</h3>
            <div class="risk-score">Risk Score: ${record.aggregate_risk_score}</div>
            <i class="fas fa-chevron-down toggle-icon"></i>
        `;

        // Create the QA pairs container
        const qaPairsDiv = document.createElement('div');
        qaPairsDiv.className = 'qa-pairs';
        
        record.qa_pairs.forEach(qaPair => {
            const qaPairDiv = document.createElement('div');
            qaPairDiv.className = 'qa-pair';
            qaPairDiv.innerHTML = `
                <div class="question">${qaPair.question}</div>
                <div class="answer">${qaPair.answer}</div>
                <div class="timestamp">${new Date(qaPair.timestamp).toLocaleString()}</div>
            `;
            qaPairsDiv.appendChild(qaPairDiv);
        });

        // Append the header and QA pairs to the session div
        sessionDiv.appendChild(headerDiv);
        sessionDiv.appendChild(qaPairsDiv);

        // Toggle the QA pairs when the header is clicked
        headerDiv.addEventListener('click', () => {
            qaPairsDiv.style.display = qaPairsDiv.style.display === 'block' ? 'none' : 'block';
            headerDiv.classList.toggle('active');
        });

        // Add the session div to the container
        container.appendChild(sessionDiv);
    });
}
