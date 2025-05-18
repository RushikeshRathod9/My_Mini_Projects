const fileInput = document.getElementById('fileInput');
const uploadContainer = document.getElementById('uploadContainer');
const imagePreview = document.getElementById('imagePreview');
const previewContainer = document.getElementById('previewContainer');
const imageDimensions = document.getElementById('imageDimensions');
const convertBtn = document.getElementById('convertBtn');
const resultCanvas = document.getElementById('resultCanvas');
const resultContainer = document.getElementById('resultContainer');
const resultDimensions = document.getElementById('resultDimensions');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const spinner = document.getElementById('spinner');

let originalImage = null;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

uploadContainer.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelection);
convertBtn.addEventListener('click', convertImage);
downloadBtn.addEventListener('click', downloadImage);

uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadContainer.classList.add('drag-over');
});
uploadContainer.addEventListener('dragleave', () => {
    uploadContainer.classList.remove('drag-over');
});
uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadContainer.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

function handleFileSelection(e) {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
}

function handleFile(file) {
    errorMessage.textContent = '';

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        errorMessage.textContent = 'Error: Only JPG and PNG formats are supported.';
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        errorMessage.textContent = 'Error: File size exceeds the 5MB limit.';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            imagePreview.src = e.target.result;
            imageDimensions.textContent = `Dimensions: ${img.width} × ${img.height} pixels`;
            previewContainer.style.display = 'block';
            convertBtn.disabled = false;
            resultContainer.style.display = 'none';
            successMessage.textContent = '';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function convertImage() {
    if (!originalImage) return;
    spinner.style.display = 'block';
    resultContainer.style.display = 'none';
    successMessage.textContent = '';

    setTimeout(() => {
        const conversionMode = document.querySelector('input[name="conversionMode"]:checked').value;
        let targetWidth = conversionMode === 'desktopToMobile' ? 1080 : 1920;
        let targetHeight = conversionMode === 'desktopToMobile' ? 1920 : 1080;

        const ctx = resultCanvas.getContext('2d');
        resultCanvas.width = targetWidth;
        resultCanvas.height = targetHeight;

        const originalAspect = originalImage.width / originalImage.height;
        const targetAspect = targetWidth / targetHeight;

        let scaledWidth, scaledHeight, offsetX = 0, offsetY = 0;

        if (originalAspect > targetAspect) {
            scaledHeight = targetHeight;
            scaledWidth = scaledHeight * originalAspect;
            offsetX = (targetWidth - scaledWidth) / 2;
        } else {
            scaledWidth = targetWidth;
            scaledHeight = scaledWidth / originalAspect;
            offsetY = (targetHeight - scaledHeight) / 2;
        }

        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(originalImage, offsetX, offsetY, scaledWidth, scaledHeight);

        resultCanvas.style.display = 'block';
        resultDimensions.textContent = `Dimensions: ${targetWidth} × ${targetHeight} pixels`;
        resultContainer.style.display = 'block';
        spinner.style.display = 'none';
        successMessage.textContent = 'Image successfully converted!';
    }, 100);
}

function downloadImage() {
    if (!resultCanvas) return;
    const link = document.createElement('a');
    link.download = 'converted_image.png';
    link.href = resultCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
