const ImageData = require('./ImageData')

const ExifImage = require('exif').ExifImage
const sharp = require('sharp')


const parseDateTime = function (exif) {
  const dt = exif['exif']['DateTimeOriginal']
  if ((typeof dt !== 'undefined' && dt !== null)) {
    const splitted = dt.split(' ')
    return [ splitted[0].replace(':', '-').replace(':', '-'), splitted[1] ].join(' ')
  }
  return null
}


const getImageDateTime = function (imgPath) {
  return new Promise((resolve) => {
    try {
      new ExifImage({ image: imgPath }, ((error, exifData) => {
        if (error || !(typeof exifData !== 'undefined' && exifData !== null)) {
          console.log('datetime getting error in callback, ignored', error)
          return resolve(null)
        }

        return resolve(parseDateTime(exifData))
      }))
    } catch (err) {
      console.log('datetime getting error, ignored', err)
      resolve(null)
    }
  })

}


/**
 * Execute resize
 *
 * @public
 * @param ImageData image
 * @return Promise
 */


module.exports = function ImageResizer_exec(width, image) {
  return sharp(image.data)
      .rotate()
      .resize(width)
      .jpeg({ progressive: true, force: false })
      .toBuffer().then((stdout) => {
          return getImageDateTime(image.data).then((datetime) => {
            return new ImageData(
              image.fileName,
              image.bucketName,
              stdout,
              datetime,
              image.getHeaders(),
              image.getFileName(),
              width
            )
          })
      })
}
