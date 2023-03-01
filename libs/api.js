
const request = require('superagent')


function getURL(bucket, original) {
  return `https://${bucket}.s3.eu-central-1.amazonaws.com/${original}`
}

function prepareForDB(image) {
  return {
    original: image.original,
    thumb: image.getFileName(),
    datetime: image.datetime,
    usergroup: 1,
    url: getURL(image.getBucketName(), image.original),
    width: image.width,
    type: image.type,
  }
}

function getApiURL() {
  if (process.env.NODE_ENV === 'debug') {
    return 'http://localhost:3333/add'
  }
  return 'https://taboryok.cz/fotky/add'
}

function sendToDB(images) {
  console.log('sending images to db:', JSON.stringify(images))
  const apiUrl = getApiURL()
  console.log('using url:', apiUrl)
  return new Promise((resolve, reject) => {
    request.post(apiUrl)
      .send(images)
      .end((err) => {
        if (err) {
          console.log('post error:', err)
          reject(err)
        } else {
          resolve(images)
        }
      })
  })
}

module.exports = function saveImages(images) {
  return sendToDB(images.map((image) => {
    return prepareForDB(image)
  })).then(() => {
    return images
  })
}
