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
      console.log('response 200', data, data.Payload);

      callFaceAnalise()
        .then(() => {
          const response = {
            statusCode: 200,
            body: JSON.parse(data.Payload),
          };
          callback(null, response);
        })
        .catch((erro) => {
          const responseError = {
            statusCode: 400,
            body: JSON.stringify({ error: erro }),
          };
          callback(responseError, null);
        });
    }
  });
};

function callFaceAnalise() {
  return new Promise((resolve, reject) => {
    const lambda = new aws.Lambda();
    const params = {
      FunctionName:
        'arn:aws:lambda:us-east-1:216203729337:function:faceAnalise',
    };
    lambda.invoke(params, function (err, data) {
      if (err) {
        console.log('erro callFaceAnalise', err);
        reject('erro');
        const responseError = {
          statusCode: 400,
          body: JSON.stringify({ error: 'Erro ao analisar face' }),
        };
        callback(responseError, null);
      } else {
        console.log('response 200 no faceAnalise');
        const response = {
          statusCode: 201,
          body: 'Foi',
        };
        resolve();
        callback(null, response);
      }
    });
  });
}
