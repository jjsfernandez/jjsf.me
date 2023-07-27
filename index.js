// Select the relevant elements
const controlPanel = document.getElementById('controlPanel');
const jsonOutput = document.getElementById('jsonOutput');
const passphraseInput = document.getElementById('passphrase');
const photo = document.getElementById('photo');
const spinner = document.getElementById('spinner');
const stopButton = document.getElementById('stopButton');
const ipOutput = document.getElementById('ipOutput');
const ipContainer = document.getElementById('ipContainer');
const copyIpButton = document.getElementById('copyIpButton');
let stopConfirm = false;

// Toggle control panel when photo is double-clicked
photo.addEventListener('dblclick', () => {
    document.body.classList.toggle('shifted');
    controlPanel.classList.toggle('hidden');
    jsonOutput.classList.add('hidden');
    ipContainer.classList.toggle('hidden');
});

// Function to make API requests
async function sendRequest(action) {

    const passphrase = passphraseInput.value;
    if (!passphrase) {
        jsonOutput.textContent = JSON.stringify("Empty Passphrase");
        jsonOutput.classList.remove('hidden');
        resetStopButton();
        return;
    }

    // Clear the JSON output
    jsonOutput.textContent = '';
    jsonOutput.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
        const response = await fetch(`https://hcei6zbcg3.execute-api.us-west-1.amazonaws.com/Prod/${action}`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passphrase: passphrase })
        });
    
        const data = await response.json();
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        jsonOutput.classList.remove('hidden');
        spinner.classList.add('hidden');

        if (action === 'stop') {
            resetStopButton();
        }
    }
    catch (error) {
        jsonOutput.textContent = `Error: ${error}`;
        jsonOutput.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

function resetStopButton() {
    stopConfirm = false;
    stopButton.textContent = 'Stop';
    stopButton.classList.remove('confirm');
}

function confirmStop() {
    if (stopConfirm) {
        sendRequest('stop');
    } else {
        stopButton.textContent = 'Are you sure?';
        stopButton.classList.add('confirm');
        stopConfirm = true;
    }
}

async function copyIpToClipboard() {
    const setButtonState = (success) => {
        if (success) {
            copyIpButton.classList.add('flash-green');
            copyIpButton.textContent = 'Copied!';
        } else {
            copyIpButton.classList.add('flash-red');
            copyIpButton.textContent = 'Failed!';
        }

        // Reset the copy button after 1 second
        setTimeout(() => {
            copyIpButton.textContent = 'Copy IP';
            copyIpButton.className = '';  // Reset classList
        }, 1000);
    }

    const text = ipOutput.value;

    try {
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
            const item = new ClipboardItem({
                "text/plain": new Blob([text], { type: "text/plain" })
            });
            
            await navigator.clipboard.write([item]);
            setButtonState(true);
        } else {
            await navigator.clipboard.writeText(text);
            setButtonState(true);
        }
    } catch (err) {
        console.error('Failed to copy to clipboard', err);
        setButtonState(false);
    }
}