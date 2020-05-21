const AWS = require('aws-sdk');

const S3 = new AWS.S3();
const Rekognition = new AWS.Rekognition();

let faceIdDetectadas = [];

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
    facesDetectadas.forEach((imagem) => {
      faceIdDetectadas.push(imagem.Face.FaceId);
    });
    resolve(faceIdDetectadas);
  });
  // comparaImagens(faceIdDetectadas);
}

function comparaImagens(faceIdDetectadas) {
  return new Promise((resolve, reject) => {
    // console.log('compara imagens');
    let resultadoComparacao = [];
    let count = 0;

    faceIdDetectadas.forEach((faceId, index) => {
      console.log(faceId);
      const params = {
        CollectionId: 'faces',
        FaceId: faceId,
        FaceMatchThreshold: 10,
        MaxFaces: 10,
      };
      const promise = Rekognition.searchFaces(params).promise();
      promise.then((data) => {
        count = count + 1;
        data.FaceMatches.forEach((face, indexFace) => {
          resultadoComparacao.push({
            similaridade: face.Similarity.toFixed(),
            nome: face.Face.ExternalImageId,
          });
        });
        if (count == faceIdDetectadas.length) {
          resolve(resultadoComparacao);
          // publicaDados(resultadoComparacao);
        }
      });
    });
  });
}

function publicaDados(dados) {
  return new Promise((resolve, reject) => {
    S3.putObject(
      {
        Bucket: 'face-analise-js-site',
        Key: 'dados.json',
        Body: JSON.stringify(dados),
        ContentType: 'application/json; charset=utf-8',
        ACL: 'public-read',
        CacheControl: 'max-age=60',
      },
      (erro, data) => {
        if (erro) {
          console.log(erro);
          reject(erro);
        } else {
          // console.log(data, 'agora exclui');
          // excluiImagensTemporarias(faceIdDetectadas);
          console.log(dados, ' dados para o front');
          resolve(dados);
        }
      }
    );
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
          console.log(erro);
          reject(erro);
        } else {
          console.log('Terminou ação ', data);
          resolve();
        }
      }
    );
  });
}

module.exports.faceAnalise = (event, context, callback) => {
  const key = event.key;
  detectaFaces(key).then((faces) =>
    criaListaFaceIdDetectadas(faces.FaceRecords).then((faceIdDetectadas) =>
      comparaImagens(faceIdDetectadas).then((resultadoComparacao) =>
        publicaDados(resultadoComparacao).then((dados) =>
          {

            excluiImagensTemporarias(faceIdDetectadas).then(() => {
              console.log(dados, ' dados no final');
              callback(null, dados);
              // return JSON.stringify(dados);
            })
          }
        )
      )
    )
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
