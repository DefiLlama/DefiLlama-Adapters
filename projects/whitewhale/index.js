const { sumTokens } = require('../helper/chain/cosmos')

async function tvl() {
    return sumTokens({chain: 'terra', owner: 'terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy'})
}

module.exports = {
    terra: {
        tvl
    },
    hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
