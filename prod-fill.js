const { handler } = require('./index')
const data = require('./res')


data.map(object => ({
  Records: [ {
    s3: {
      bucket: {
        name: 'tabor-vjttrnt',
      },
      object: Object.assign({}, object, {
        key: object.Key || object.key,
      }),
    },
  } ],
})).forEach((event) => {
  handler(event, {
    succeed: console.log.bind(console),
    fail: console.error.bind(console),
  })
})

