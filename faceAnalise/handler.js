const AWS = require('aws-sdk');

const Rekognition = new AWS.Rekognition();

function detectaFaces(key) {
  const params = {
    CollectionId: 'faces',
    DetectionAttributes: ['DEFAULT'],
    ExternalImageId: 'imagemTemporaria',
    Image: {
      S3Object: {
        Bucket: 'face-analise-js-example',
        Name: key,
      },
    },
  };
  return Rekognition.indexFaces(params).promise();
}

function criaListaFaceIdDetectadas(facesDetectadas) {
  return new Promise((resolve, reject) => {
    // console.log('### criaListaFaceIdDetectadas ###', facesDetectadas);
    let faceIdDetectadas = [];
    facesDetectadas.forEach((imagem) => {
      faceIdDetectadas.push(imagem.Face.FaceId);
    });
    resolve(faceIdDetectadas);
  });
}

function comparaImagens(faceIdDetectadas) {
  return new Promise((resolve, reject) => {
    let resultadoComparacao = [];
    let count = 0;

    faceIdDetectadas.forEach((faceId, index) => {
      console.log(faceId, '#FACEID#');
      const params = {
        CollectionId: 'faces',
        FaceId: faceId,
        FaceMatchThreshold: 10,
        MaxFaces: 10,
      };
      const promise = Rekognition.searchFaces(params).promise();
      promise
        .then((data) => {
          count = count + 1;
          data.FaceMatches.forEach((face, indexFace) => {
            resultadoComparacao.push({
              similaridade: face.Similarity.toFixed(),
              nome: face.Face.ExternalImageId,
            });
          });
          if (count == faceIdDetectadas.length) {
            resolve(resultadoComparacao);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
}

function excluiImagensTemporarias(faceIdDetectadas) {
  return new Promise((resolve, reject) => {
    Rekognition.deleteFaces(
      {
        CollectionId: 'faces',
        FaceIds: faceIdDetectadas,
      },
      (erro, data) => {
        if (erro) {
          console.log(erro, 'erro ao excluir imagens');
          reject(erro);
        } else {
          console.log('Terminou ação ', data);
          resolve();
        }
      }
    );
  });
}

module.exports.main = (event, context, callback) => {
  const key = event.key;
  detectaFaces(key).then((faces) =>
    criaListaFaceIdDetectadas(faces.FaceRecords)
      .then((faceIdDetectadas) => {
        comparaImagens(faceIdDetectadas)
          .then((resultadoComparacao) => {
            console.log(resultadoComparacao, 'resultado comparação');
            excluiImagensTemporarias(faceIdDetectadas).then(() => {
              callback(null, resultadoComparacao);
            });
          })
          .catch((error) => {
            excluiImagensTemporarias(faceIdDetectadas).then(() => {
              callback(error, null);
            });
          });
      })
      .catch((error) => console.log(error, 'erro detecta faces'))
  );
};

// function deletaFaces() {
//   Rekognition.deleteFaces(
//     {
//       CollectionId: 'faces',
//       FaceIds: [
//         'a9473a44-ceee-42c3-b3cc-fb4ca2a1ef9f'
//       ],
//     },
//     (erro, resultado) => {
//       if (erro) console.log(erro);
//       else console.log(resultado);
//     }
//   );
// }

// deletaFaces();

// function deletaCollection() {
//     var params = {
//         CollectionId: "faces"
//         };
//         Rekognition.deleteCollection(params, (erro, data) => {
//             if (erro) console.log(erro)
//             else console.log(data, 'deletado')
//         })
// }

// deletaCollection()

// function criaColecao() {
//     Rekognition.createCollection({
//         CollectionId: 'faces'
//     }, (erro, data) => {
//         if (erro) console.log(erro)
//         else console.log(data, ' criado')
//     })
// }

// criaColecao()
