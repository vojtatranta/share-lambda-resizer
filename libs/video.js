const saveImages = require('./api')
const ImageData = require('./ImageData')
const createS3Client = require('./s3-client-factory')

const client = createS3Client()

module.exports = (s3Object) => {
  const { object, bucket } = s3Object
  return new Promise((reject) => {
    client.headObject({
      Bucket: bucket.name,
      Key: object.key,
    }, (err) => {
      if (err) {
        reject(err)
        return
      }

      const image = new ImageData(object.key, bucket.name, '', null, {}, object.key, 400, 'video')
      return saveImages([ image ])
    })
  })
}
