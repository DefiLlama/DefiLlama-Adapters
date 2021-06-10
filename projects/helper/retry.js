const retryModule = require('async-retry')

async function retry(func){
    return retryModule(func, {
        retries:3
    })
}

module.exports = retry