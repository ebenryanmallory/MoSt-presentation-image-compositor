const settings = {};
settings['color'] = '#2a3c44';

async function post() {
    const url = '/composite-image'
    const response = await fetch(url, {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(settings)
    });
    return response.blob();
}

async function getImage() {
    let returnedImage = await post();
    let returnedImageBlob = await returnedImage;
    const returnedImageURL = URL.createObjectURL(returnedImageBlob)
    document.querySelector('img#result-image').remove();
    let updateImage = document.createElement('img');
    updateImage.src = "temp/result.png";
    updateImage.src = returnedImageURL;
    updateImage.id = "result-image";
    document.querySelector('div#image-holder').appendChild(updateImage)
}

function selectColor(colorSource) {
    document.querySelectorAll('.border').forEach(border => border.classList.remove('border'));
    colorSource.classList.add('border');
    let selectedColor = colorSource.getAttribute('data-color');
    if (selectedColor === 'custom') { 
        selectedColor = colorSource.value;
        document.querySelector('.colorpicker').style.background = colorSource.value;
    };
    settings['color'] = selectedColor;
    gatherSettings();
    getImage();
}
function gatherSettings() {
    let snapshotURL = document.querySelector('input#url').value;
    settings['url'] = snapshotURL;
    settings['windowLocation'] = window.location.href;
}
function checkFileUpload() {
    var leftFileInput = document.querySelector('input#left');
    var rightFileInput = document.querySelector('input#right');
    var feedback = ``;
    if ('files' in leftFileInput) {
        if (leftFileInput.files.length == 0 && rightFileInput.files.length == 0) { return feedback = "Select one or more files." };
        if (leftFileInput.files.length > 0) {
            var leftFile = leftFileInput.files[0];
            let leftReader = new FileReader();
            leftReader.readAsDataURL(leftFile);
            leftReader.onload = function() {
                console.log(leftReader.result);
                settings['leftFile'] = leftReader.result;
            };
            leftReader.onerror = function() {
                console.log(leftReader.error);
            };
            if (leftFile.name) {
                feedback = feedback.concat(`File name: ${leftFile.name} | `);
            }
            if (leftFile.size) {
                feedback = feedback.concat(`File size: ${leftFile.size} | `);
            }
        }
    }
    if ('files' in rightFileInput) {
        if (leftFileInput.files.length == 0 && rightFileInput.files.length == 0) { return feedback = "Select one or more files." };
        if (rightFileInput.files.length > 0) {
            var rightFile = rightFileInput.files[0];
            let rightReader = new FileReader();
            rightReader.readAsDataURL(rightFile);
            rightReader.onload = function() {
                console.log(rightReader.result);
                settings['rightFile'] = rightReader.result;
            };
            rightReader.onerror = function() {
                console.log(rightReader.error);
            };
            if (rightFile.name) {
                feedback = feedback.concat(`File name: ${rightFile.name} | `);
            }
            if (rightFile.size) {
                feedback = feedback.concat(`File size: ${rightFile.size} | `);
            }
        }
    }
    document.querySelector('p#feedback').classList.remove('hidden');
    document.querySelector('p#feedback').innerText = feedback;
}