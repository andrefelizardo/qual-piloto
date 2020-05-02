function actionChooseImage() {
    const input = document.querySelector('input[type=file]#image');
    input.addEventListener('change', (data) => {
        // console.log(data);
        const file = data.path[0].files[0];
        console.log(file)
    })
}

actionChooseImage();