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

function toggleDownloadOptions() {
    document.querySelector('.dropdown').classList.toggle('hidden');
}

function gatherSettings() {
    let snapshotURL = document.querySelector('input#url').value;
    settings['url'] = snapshotURL;
    settings['windowLocation'] = window.location.href;
}

function checkFileUpload() {
    var leftFileInput = document.querySelector('input#left');
    var rightFileInput = document.querySelector('input#right');
    var file_info = ``;
    if ('files' in leftFileInput) {
        if (leftFileInput.files.length == 0 && rightFileInput.files.length == 0) { return file_info = "Select one or more files." };
        if (leftFileInput.files.length > 0) {
            var leftFile = leftFileInput.files[0];
            let leftReader = new FileReader();
            leftReader.readAsDataURL(leftFile);
            leftReader.onload = function() {
                settings['leftFile'] = leftReader.result;
            };
            leftReader.onerror = function() {
                file_info = file_info.concat(`Please try again. The following error has occured: ${leftReader.error}`);
            };
            if (leftFile.name) {
                file_info = file_info.concat(`Left image: ${leftFile.name} `);
            }
            if (leftFile.size) {
                file_info = file_info.concat(`Image size: ${leftFile.size}`);
            }
        }
    }
    if ('files' in rightFileInput) {
        if (leftFileInput.files.length == 0 && rightFileInput.files.length == 0) { return file_info = "Select one or more files." };
        if (rightFileInput.files.length > 0) {
            var rightFile = rightFileInput.files[0];
            let rightReader = new FileReader();
            rightReader.readAsDataURL(rightFile);
            rightReader.onload = function() {
                settings['rightFile'] = rightReader.result;
            };
            rightReader.onerror = function() {
                file_info = file_info.concat(`Please try again. The following error has occured: ${rightReader.error}`);
            };
            if (rightFile.name) {
                file_info = file_info.concat(`Right image: ${rightFile.name} `);
            }
            if (rightFile.size) {
                file_info = file_info.concat(`Image size: ${rightFile.size}`);
            }
        }
    }
    document.querySelector('p#file_info').classList.remove('hidden');
    document.querySelector('p#file_info').innerText = file_info;
}