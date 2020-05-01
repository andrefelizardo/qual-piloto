const AWS = require('aws-sdk');

const S3 = new AWS.S3();
const Rekognition = new AWS.Rekognition();

let faceIdDetectadas = [];

function detectaFaces() {
  const params = {
    CollectionId: 'faces',
    DetectionAttributes: ['DEFAULT'],
    ExternalImageId: 'imagemTemporaria',
    Image: {
      S3Object: {
        Bucket: 'face-analise-js-example',
        Name: '_analise.png',
      },
    },
  };
  return Rekognition.indexFaces(params).promise();
}

function criaListaFaceIdDetectadas(facesDetectadas) {
  console.log('### criaListaFaceIdDetectadas ###', facesDetectadas);
  facesDetectadas.forEach((imagem) => {
    faceIdDetectadas.push(imagem.Face.FaceId);
  });
  comparaImagens(faceIdDetectadas);
}

async function comparaImagens(faceIdDetectadas) {
  let resultadoComparacao = [];
  let count = 0;

  faceIdDetectadas.forEach(async (faceId, index) => {
    params = {
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
        publicaDados(resultadoComparacao);
      }
    });
  });
}

function publicaDados(dados) {
  console.log(JSON.stringify(dados));
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
      if (erro) console.log(erro);
      else {
        console.log(data);
        excluiImagensTemporarias(faceIdDetectadas);
      }
    }
  );
}

function excluiImagensTemporarias(faceIdDetectadas) {
  Rekognition.deleteFaces(
    {
      CollectionId: 'faces',
      FaceIds: faceIdDetectadas,
    },
    (erro, data) => {
      if (erro) console.log(erro);
      else console.log('Terminou ação ', data);
    }
  );
}

module.exports.faceAnalise = (event) => {
  console.log('face Analise');
  detectaFaces().then((faces) => criaListaFaceIdDetectadas(faces.FaceRecords));
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
//        };
//        Rekognition.deleteCollection(params, (erro, data) => {
//            if (erro) console.log(erro)
//            else console.log(data, 'deletado')
//        })
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
