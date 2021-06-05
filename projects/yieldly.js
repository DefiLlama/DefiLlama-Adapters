var atob = require("atob"); // needed for decrypting values from contract
const utils = require('./helper/utils');

async function fetch() {
    let tvl = 0 

    // Algorand token staked
    let algorandStaked = 0
    await utils.fetchURL('https://algoexplorerapi.io/v2/applications/233725844')
    .then(body => {
      body.data.params['global-state'].forEach((element) => {
        if (atob(element.key) == "GA") {
          algorandStaked = element.value.uint / 10**6
        }
      });
    })

    // ASA yieldly token staked
    // let yieldlyStaked = 0
    //   To be enabled when trading starts

    // await fetch('https://algoexplorerapi.io/v2/applications/233725850')
    // .then(body => {
    //     JSON.parse(body).params['global-state'].forEach((element) => {
    //     if (atob(element.key) == "GA") {
    //         yieldlyStaked = element.value.uint / 10**6
    //     }
    //     });
    // })

    let algoPrice = 0
    await utils.fetchURL('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd')
      .then(body => {
        algoPrice = body.data.algorand.usd
      })

    tvl = tvl + (algorandStaked * algoPrice)
    // console.log(tvl)
    // tvl = tvl + (yieldlyStaked * 0.002) // Yieldly price set to raise price until trading is open
    return tvl
}
// fetch()

module.exports = {
    fetch
}
