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
    sendImageToBucket(newFile);
  });
}

function initUpload() {
  document.querySelector('.container-principal__botao-upload').classList.add('uploading')
}

function sendImageToBucket(file) {
    initUpload();
    const headersAPI = new Headers();
    headersAPI.append('x-api-key', 'KVeA4Rn3qPaOm0TOIw7lT44F2taCi9q63fn99GP2');
    fetch(
      'https://4vic25fj6b.execute-api.us-east-1.amazonaws.com/prod/upload-photo',
      {
        method: 'POST',
        body: file,
        headers: headersAPI,
      }
    )
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        alert('Provavelmente erro de CORS filhão')
        console.log(error)
      });
}

actionChooseImage();
