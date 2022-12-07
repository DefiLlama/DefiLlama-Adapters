const { lookupApplications, } = require("../helper/chain/algorand");

async function staking() {

    //OPUL Staking Pool, expires on timestamp 1668988799 (November 20th)
    const poolId = 843061415
    let response = await lookupApplications(poolId)
    var poolAmount

    for (const y of response.application.params["global-state"]) {
        let decodedKey = Buffer.from(y.key, 'base64').toString('binary')
        if (decodedKey === "pool_size") {
          //OPUL has 10 digits
          poolAmount = y.value.uint / 1e10
        }
      }

    return {
        'opulous': poolAmount
    }

}

module.exports = {
        //timetravel: true,
        //start: 1660827158,
        methodology: `Counts the number of OPUL tokens locked in the staking pool.`,
        algorand: {
            tvl: () => ({}),
            staking: staking
        }
}

// node test.js projects/opulous/index.js
