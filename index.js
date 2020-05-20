const AWS = require('aws-sdk');

if (!AWS.config.region) {
  AWS.config.update({
    region: 'us-east-1',
  });
}

const S3 = new AWS.S3();
const Rekognition = new AWS.Rekognition();

const bucketParams = {
  Bucket: 'face-analise-js-example',
};

function listaImagens() {
  let imagens = [];

  S3.listObjects(bucketParams, (erro, data) => {
    if (erro) {
      console.log(erro);
    } else {
      const arrayImagens = data.Contents;

      arrayImagens.forEach((imagem) => {
        imagens.push(imagem.Key);
      });

      indexaColecao(imagens);
    }
  });
}

function indexaColecao(imagens) {
  imagens.forEach((imagem) => {
    console.log(imagem);
    Rekognition.indexFaces(
      {
        CollectionId: 'faces',
        DetectionAttributes: [],
        ExternalImageId: imagem.slice(0, imagem.length - 4),
        Image: {
          S3Object: {
            Bucket: 'face-analise-js-example',
            Name: imagem,
          },
        },
      },
      (erro, data) => {
        if (erro) console.log(erro, erro.stack);
        else console.log(data);
      }
    );
  });
}

listaImagens();
