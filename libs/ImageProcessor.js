const resize = require('./ImageResizer')
const ImageReducer = require('./ImageReducer')
const S3 = require('./S3')
const saveImages = require('./api')

/**
 * Image processor
 * management resize/reduce image list by configration,
 * and pipe AWS Lambda's event/context
 *
 * @constructor
 * @param Object s3Object
 * @param Object context
 */
function ImageProcessor(s3Object) {
  this.s3Object = s3Object
}


/**
 * Run the process
 *
 * @public
 * @param Config config
 */
ImageProcessor.prototype.run = function ImageProcessor_run(config) {
  console.log('processos starts runnning (libs)', config)
  // If object.size equals 0, stop process
  if (this.s3Object.object.size === 0) {
    throw new Error('Object size equal zero. Nothing to process.')
  }

  if (!config.get('bucket')) {
    config.set('bucket', this.s3Object.bucket.name)
  }

  console.log('processos starts downloading (libs)', config)
  return S3.getObject(
    this.s3Object.bucket.name,
    this.s3Object.object.key
  )
    .then((imageData) => {
      console.log('image downloaded, starting processing...', config)
      return this.processImage(imageData, config)
    }, (err) => {
      throw err
    })
    .then((results) => {
      return S3.putObjects(results)
    })
}

ImageProcessor.prototype.processImage = function ImageProcessor_processImage(imageData, config) {
  const reduce = config.get('reduce', {})
  const resizes = config.get('resizes', [])
  console.log('planned resizes', resizes)
  const promiseList = resizes.filter((option) => {
    return option.size && option.size > 0
  }).map((option) => {
    if (!option.bucket) {
      option.bucket = config.get('bucket')
    }
    return this.execResizeImage(option, imageData)
  })

  if (!reduce.bucket) {
    reduce.bucket = config.get('bucket')
  }

  return Promise.all(promiseList)
    .then(saveImages)
}


/**
 * Execute resize image
 *
 * @public
 * @param Object option
 * @param imageData imageData
 * @return Promise
 */
ImageProcessor.prototype.execResizeImage = function (option, imageData) {
  console.log('execution of the resize', option)
  return resize(option.size, imageData)
    .then((resizedImage) => {
      let dir = option.directory || resizedImage.getDirName()

      if (dir) {
        dir = `${dir.replace(/\/$/, '')}/`
      }
      resizedImage.fileName = dir + resizedImage.getFileName()
      return resizedImage
    })
}

/**
 * Execute reduce image
 *
 * @public
 * @param Object option
 * @param ImageData imageData
 * @return Promise
 */
ImageProcessor.prototype.execReduceImage = function (option, imageData) {
  const reducer = new ImageReducer(option)

  return reducer.exec(imageData)
}

module.exports = ImageProcessor
