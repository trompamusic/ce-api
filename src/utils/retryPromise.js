export default (fn, maxTries = 5, delay = 1000) => {
  return new Promise((resolve, reject) => {
    let attempt = 1

    function runFunction () {
      fn().then(resolve).catch((error) => {
        if (attempt >= maxTries) {
          return reject(new Error('Max tries reached, last error: ' + error.message))
        }

        attempt++
        setTimeout(runFunction, delay)
      })
    }

    runFunction()
  })
}
