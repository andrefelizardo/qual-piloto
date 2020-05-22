function actionChooseImage() {
  const input = document.querySelector('input[type=file]#image');
  input.addEventListener('change', (data) => {
    const file = data.path[0].files[0];
    const blob = file.slice(0, file.size, file.type);
    const newName = file.name.replace(
      file.name.slice(0, file.name.indexOf('.')),
      '_analise'
    );
    newFile = new File([blob], newName, { type: file.type });
    sendImageToBucket(newFile, file.type);
  });
}

function initUpload() {
  document
    .querySelector('.container-principal__botao-upload')
    .classList.add('uploading');
  document.querySelector('.container-principal').classList.add('uploading');
  updateProgress(10, 100);
}

function sendImageToBucket(file, fileType) {
  initUpload();
  axios
    .post(
      'https://4vic25fj6b.execute-api.us-east-1.amazonaws.com/prod/upload-photo',
      file,
      {
        headers: {
          'x-api-key': 'KVeA4Rn3qPaOm0TOIw7lT44F2taCi9q63fn99GP2',
          'content-type': fileType,
        },
        onUploadProgress: (progressEvent) =>
          updateProgress(progressEvent.loaded, progressEvent.total),
      }
    )
    .then((res) => {
      const data = JSON.parse(res.data.body);
      showResults(data);
    })
    .catch((error) => {
      alert('Provavelmente erro de CORS filhão');
      console.log(error);
    });
}

function updateProgressOnButton(progress, finished) {
  const textButton = document.querySelector('.botao-upload__texto-uploading');
  if (!finished) {
    textButton.innerText = progress;
  } else {
    textButton.innerText = 'processando...';
  }
}

function updateProgress(loaded, total) {
  const progress = parseInt((loaded / total) * 100) + '%';
  updateProgressOnButton(progress, loaded == total ? true : false);
  updateProgressOnBackground(progress);
}

function updateProgressOnBackground(progress) {
  const body = document.querySelector('body');
  body.style.background = `linear-gradient(90deg, rgba(255,204,104,1) 0%, rgba(255,204,104,1) ${progress}, rgba(28,37,217,1) ${progress}, rgba(28,37,217,1) 100%)`;
}

function showResults(data) {

}

actionChooseImage();
