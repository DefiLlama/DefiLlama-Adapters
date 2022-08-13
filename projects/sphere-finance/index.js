const utils = require('../helper/utils')

function fetch() {
    return async () => utils.fetchURL('https://spheretvl.simsalacrypto.workers.dev/').then(d => ({ 'usd-coin':  d.data['portfolio']['net_worth'] }))
}

module.exports = {
    timetravel: false,
    polygon: {
        tvl: fetch()
    },
}
