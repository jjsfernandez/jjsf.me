// Select the relevant elements
const controlPanel = document.getElementById('controlPanel');
const jsonOutput = document.getElementById('jsonOutput');
const passphraseInput = document.getElementById('passphrase');
const photo = document.getElementById('photo');
const spinner = document.getElementById('spinner');


// Toggle control panel when photo is double-clicked
photo.addEventListener('dblclick', () => {
    controlPanel.classList.toggle('hidden');
});

// Function to make API requests
function sendRequest(action) {

    const passphrase = passphraseInput.value;
    if(!passphrase){
        jsonOutput.textContent = JSON.stringify("Empty Passphrase");
        jsonOutput.classList.remove('hidden');
        return;
    }
    const url = `https://hcei6zbcg3.execute-api.us-west-1.amazonaws.com/Prod/${action}?passphrase=${passphrase}`;

     const config = {
        method: action === 'status' ? 'GET' : 'POST', // specify the request method
        headers: {
            'Content-Type': 'application/json', // specify the content type
        },
    };

    // Clear the JSON output
    jsonOutput.textContent = '';
    jsonOutput.classList.add('hidden');
    spinner.classList.remove('hidden');

    fetch(url, config)
        .then(response => response.json())
        .then(data => {
            jsonOutput.textContent = JSON.stringify(data, null, 2);
            jsonOutput.classList.remove('hidden');
            spinner.classList.add('hidden');
        })
        .catch(error => {
            jsonOutput.textContent = `Error: ${error}`;
            jsonOutput.classList.remove('hidden');
            spinner.classList.add('hidden');
        });
}
