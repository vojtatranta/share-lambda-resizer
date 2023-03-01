const aws = require('aws-sdk')

module.exports = () => new aws.S3({ signatureVersion: 'v4', region: 'eu-central-1' })
