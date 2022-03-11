const sdk = require('@defillama/sdk');
const { getaETHcTvl, getaMATICbTvl, getaDOTbTvl, getaKSMbTvl } = require('../config/ankr/ethereum');
const { getaFTMbTvl } = require('../config/ankr/fantom');
const { getaAVAXbTvl } = require('../config/ankr/avalanche');
const { getaBNBbTvl } = require('../config/ankr/binance');

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

async function tvl(timestamp, block) {
  const supply = await sdk.api.erc20.totalSupply({
    target: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
    block
  })

  return {
    [wethAddress]: supply.output
  }
}

module.exports = {
  ethereum: {
    tvl,
    aETHc: getaETHcTvl,
    aMATICb: getaMATICbTvl,
    aDOTb: getaDOTbTvl,
    aKSMb: getaKSMbTvl,
  },
  fantom: {
    tvl: getaFTMbTvl,
  },
  avalanche: {
    tvl: getaAVAXbTvl,
  },
  binance: {
    tvl: getaBNBbTvl,
  },
  methodology: `We get the total supply of aETHc, the ETH staking contract and convert it to USD.`
}
