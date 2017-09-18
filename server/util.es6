'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
const NoncommercialApplication = require('./models/noncommercial-application.es6');
const request = require('request');
const TempOutfitterApplication = require('./models/tempoutfitter-application.es6');
const vcapConstants = require('./vcap-constants.es6');

let extractField = (errorObj, withArg) => {
  if (withArg && errorObj.property === 'instance') {
    return errorObj.argument;
  } else if (withArg) {
    // assumption is that the string otherwise is 'instance.<field>'
    return errorObj.property.substring(9) + '.' + errorObj.argument;
  } else {
    return errorObj.property.substring(9);
  }
};

let util = {};

util.collateErrors = (result, errorArr, prefix) => {
  for (var error of result.errors) {
    if (error.name === 'required') {
      errorArr.push(error.name + '-' + (prefix ? prefix : '') + extractField(error, true));
    } else if (error.name === 'enum' || error.name === 'pattern' || error.name === 'type') {
      errorArr.push(error.name + '-' + (prefix ? prefix : '') + extractField(error, false));
    }
  }

  return errorArr;
};

util.validateDateTime = input => {
  return (
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/.test(input) &&
    moment(input, 'YYYY-MM-DDTHH:mm:ssZ').isValid()
  );
};

util.getAllOpenApplications = (req, res) => {
  let noncommercialApplicationsPromise = NoncommercialApplication.findAll({
    attributes: [
      'appControlNumber',
      'applicantInfoPrimaryFirstName',
      'applicantInfoPrimaryLastName',
      'applicationId',
      'createdAt',
      'eventName',
      'noncommercialFieldsEndDateTime',
      'noncommercialFieldsLocationDescription',
      'noncommercialFieldsStartDateTime',
      'status'
    ],
    where: {
      $or: [
        {
          status: 'Received'
        },
        {
          status: 'Hold'
        }
      ],
      noncommercialFieldsEndDateTime: {
        $gt: new Date()
      }
    },

    order: [['createdAt', 'DESC']]
  });
  let tempOutfitterApplicationPromise = TempOutfitterApplication.findAll({
    attributes: [
      'appControlNumber',
      'applicantInfoOrganizationName',
      'applicantInfoPrimaryFirstName',
      'applicantInfoPrimaryLastName',
      'applicationId',
      'createdAt',
      'status',
      'tempOutfitterFieldsActDescFieldsEndDateTime',
      'tempOutfitterFieldsActDescFieldsLocationDesc',
      'tempOutfitterFieldsActDescFieldsStartDateTime'
    ],
    where: {
      $or: [
        {
          status: 'Received'
        },
        {
          status: 'Hold'
        }
      ],
      tempOutfitterFieldsActDescFieldsEndDateTime: {
        $gt: new Date()
      }
    },
    order: [['createdAt', 'DESC']]
  });
  Promise.all([noncommercialApplicationsPromise, tempOutfitterApplicationPromise])
    .then(results => {
      for (let item of results[0]) {
        item.type = 'Noncommercial';
      }
      for (let item of results[1]) {
        item.type = 'Temp outfitter';
      }
      res.status(200).json(results[0].concat(results[1]));
    })
    .catch(errors => {
      res.status(500).json(errors);
    });
};

util.middleLayerAuth = () => {
  let requestOptions = {
    url: vcapConstants.middleLayerBaseUrl + 'auth',
    json: true,
    body: {
      username: vcapConstants.middleLayerUsername,
      password: vcapConstants.middleLayerPassword
    }
  };
  return new Promise((resolve, reject) => {
    request.post(requestOptions, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error || response);
      } else {
        resolve(body.token);
      }
    });
  });
};

util.prepareCerts = () => {
  let s3 = new AWS.S3({
    accessKeyId: vcapConstants.certsAccessKeyId,
    secretAccessKey: vcapConstants.certsSecretAccessKey,
    region: vcapConstants.certsRegion
  });

  let loginGovPrivateKeyPromise = new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: vcapConstants.certsBucket,
        Key: vcapConstants.loginGovPrivateKey
      },
      (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data.Body.toString('utf8'));
      }
    );
  });

  let loginGovDecryptionCertPromise = new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: vcapConstants.certsBucket,
        Key: vcapConstants.loginGovDecryptionCert
      },
      (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data.Body.toString('utf8'));
      }
    );
  });

  return Promise.all([loginGovPrivateKeyPromise, loginGovDecryptionCertPromise]);
};

let getExtension = filename => {
  return filename.split('.').reverse()[0];
};

util.getContentType = filename => {
  if (getExtension(filename) === 'pdf') {
    return 'application/pdf';
  }
  if (getExtension(filename) === 'rtf') {
    return 'application/rtf';
  }
  if (getExtension(filename) === 'doc') {
    return 'application/msword';
  }
  if (getExtension(filename) === 'docx') {
    return 'application/msword';
  }
  if (getExtension(filename) === 'xls') {
    return 'application/vnd.ms-excel';
  }
  if (getExtension(filename) === 'xlsx') {
    return 'application/vnd.ms-excel';
  }
};

// used to bypass authentication when doing development
util.isLocalOrCI = () => {
  const environments = ['CI', 'local'];
  if (environments.indexOf(process.env.PLATFORM) !== -1) {
    return true;
  }
  return false;
};

util.capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = util;
