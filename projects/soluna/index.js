const { sumTokens, } = require('../helper/chain/cosmos')

async function tvl(timestamp, ethBlock, { terra: block }) {
  return sumTokens({ owner: 'terra1qwzdua7928ugklpytdzhua92gnkxp9z4vhelq8', chain: 'terra'})
}

module.exports = {
  terra: {
    tvl
  },
hallmarks:[
[1651881600, "UST depeg"],
  ]
}
