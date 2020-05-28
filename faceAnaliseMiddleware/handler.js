'use strict';
var aws = require('aws-sdk');

module.exports.main = (event, context, callback) => {
  var lambda = new aws.Lambda();
  var opts = {
    FunctionName: 'arn:aws:lambda:us-east-1:216203729337:function:uploadToS3',
    Payload: JSON.stringify({ event }),
  };

  lambda.invoke(opts, function (err, data) {
    if (err) {
      console.log('error : ' + err);
      const responseError = {
        statusCode: 400,
        body: JSON.stringify({ error: 'Erro ao fazer upload' }),
      };
      callback(responseError, null);
    } else if (data) {

      callFaceAnalise()
        .then((dados) => {
          const response = {
            body: JSON.stringify(dados.Payload),
          };
          callback(null, response);
        })
        .catch((erro) => {
          console.log(erro, 'erro callFaceAnalise')
          // const responseError = {
          //   statusCode: 400,
          //   body: JSON.stringify({ error: erro }),
          // };
          // callback(responseError, null);
          const responseError = {
            errorType : "InternalServerError",
            httpStatus : 400,
            requestId : context.awsRequestId,
            trace : {
                "function": "abc()",
                "line": 123,
                "file": "abc.js"
            }
        }
        callback(JSON.stringify(myErrorObj));
        });
    }
  });
};

function callFaceAnalise() {
  return new Promise((resolve, reject) => {
    const lambda = new aws.Lambda();
    const params = {
      FunctionName:
        'faceanalise-dev-main',
        Payload: JSON.stringify({
          key: '_analise.png'
        })
    };
    lambda.invoke(params, function (err, data) {
      console.log(data.FunctionError);
      if (data.FunctionError) {
        console.log('erro callFaceAnalise', err);
        const responseError = {
          statusCode: 400,
          body: JSON.stringify({ error: 'Erro ao analisar face' }),
        };
        reject(responseError);
        // callback(responseError, null);
      } else {
        console.log(data, 'retorno do faceAnalise');
        resolve(data);
        // callback(null, response);
      }
    });
  });
}
