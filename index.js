// Select the relevant elements
const controlPanel = document.getElementById('controlPanel');
const jsonOutput = document.getElementById('jsonOutput');
const passphraseInput = document.getElementById('passphrase');
const photo = document.getElementById('photo');
const spinner = document.getElementById('spinner');
const stopButton = document.getElementById('stopButton');
const ipOutput = document.getElementById('ipOutput');
const ipOutputContainer = document.getElementById('ipOutputContainer');
const copyIpButton = document.getElementById('copyIpButton');
let stopConfirm = false;

// Toggle control panel when photo is double-clicked
photo.addEventListener('dblclick', () => {
    controlPanel.classList.toggle('hidden');
    jsonOutput.classList.add('hidden');
    ipOutputContainer.classList.add('hidden');
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

        // Check if the response is an object before using 'in'
        if (typeof data === 'object' && 'ip' in data) {
            ipOutput.value = data.ip;
            ipOutputContainer.classList.remove('hidden');
        }

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
    try {
        const result = await navigator.permissions.query({ name: "clipboard-write" });
        if (result.state === "granted" || result.state === "prompt") {
            try {
                await navigator.clipboard.writeText(ipOutput.value);
                copyIpButton.classList.add('flash-green');
                copyIpButton.textContent = 'Copied!';
            } catch (err) {
                copyIpButton.classList.add('flash-red');
            } finally {
                setTimeout(() => {
                    console.log('timeout');
                    copyIpButton.textContent = 'CopyIP';
                }, 1000);
            }
        }
    } catch (err) {
        console.error(err);
    }
}
