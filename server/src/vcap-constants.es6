'use strict';

/**
 * Module for VCAP Consntants
 * @module vcap-constants
 */

/** VCAP environment variables are used by cloud.gov to pass in instance specific settings. */
const vcapServices = JSON.parse(process.env.VCAP_SERVICES);
const vcapApplication = JSON.parse(process.env.VCAP_APPLICATION);

const vcapConstants = {};

const getUserProvided = function(name) {
  return vcapServices['user-provided'].find(element => {
    return element.name === name;
  });
};

/** Base URL of this instance */
vcapConstants.baseUrl = 'https://' + vcapApplication.uris[0];

/** Intake S3 bucket settings */
const intakeS3 = vcapServices['s3'].find(element => {
  return element.name === 'intake-s3';
});
vcapConstants.accessKeyId = intakeS3.credentials.access_key_id;
vcapConstants.secretAccessKey = intakeS3.credentials.secret_access_key;
vcapConstants.region = intakeS3.credentials.region;
vcapConstants.bucket = intakeS3.credentials.bucket;

/** Middle layer settings */
const middlelayerService = getUserProvided('middlelayer-service');
vcapConstants.middleLayerBaseUrl = middlelayerService.credentials.middlelayer_base_url;
vcapConstants.middleLayerUsername = middlelayerService.credentials.middlelayer_username;
vcapConstants.middleLayerPassword = middlelayerService.credentials.middlelayer_password;

/** Intake module settings */
const intakeService = getUserProvided('intake-client-service');
vcapConstants.intakeClientBaseUrl = intakeService.credentials.intake_client_base_url;
vcapConstants.intakeUsername = intakeService.credentials.intake_username;
vcapConstants.intakePassword = intakeService.credentials.intake_password;
vcapConstants.jwtSecret = intakeService.credentials.jwt_secret;

/** Login.gov settings */
const loginGovService = getUserProvided('login-service-provider');
vcapConstants.loginGovIssuer = loginGovService.credentials.issuer;
vcapConstants.loginGovJwk = loginGovService.credentials.jwk;
vcapConstants.loginGovIdpUsername = loginGovService.credentials.idp_username;
vcapConstants.loginGovIdpPassword = loginGovService.credentials.idp_password;
vcapConstants.loginGovDiscoveryUrl = loginGovService.credentials.discovery_url;

/** USDA eAuth settings */
const eAuthService = getUserProvided('eauth-service-provider');
vcapConstants.eAuthUserWhiteList = eAuthService.credentials.whitelist;
vcapConstants.eAuthIssuer = eAuthService.credentials.issuer;
vcapConstants.eAuthEntryPoint = eAuthService.credentials.entrypoint;
vcapConstants.eAuthCert = eAuthService.credentials.cert;
vcapConstants.eAuthPrivateKey = eAuthService.credentials.private_key;

/** SMTP settings */
const smtp = getUserProvided('smtp-service');
vcapConstants.smtpHost = smtp.credentials.smtp_server;
vcapConstants.smtpUsername = smtp.credentials.username;
vcapConstants.smtpPassword = smtp.credentials.password;
vcapConstants.specialUseAdminEmailAddresses = smtp.credentials.admins;

/**
 * VCAP Constants
 * @exports vcapConstants
 */
module.exports = vcapConstants;
