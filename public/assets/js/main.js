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
          updateProgressOnButton(progressEvent.loaded, progressEvent.total),
      }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      alert('Provavelmente erro de CORS filhão');
      console.log(error);
    });
}

function updateProgressOnButton(loaded, total) {
  const textButton = document.querySelector('.botao-upload__texto-uploading');
  if (loaded !== total) {
    textButton.innerText = parseInt((loaded / total) * 100) + '%';
  } else {
    textButton.innerText = 'processando...'
  }
}

actionChooseImage();
