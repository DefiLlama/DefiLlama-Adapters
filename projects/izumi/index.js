const { staking } = require('../helper/staking')
const { unwrapNFTs } = require('./utils')
const { default: axios } = require("axios");
const retry = require("async-retry");

async function getConfig(chainId) {
  const data = await retry(
      async bail =>
        await axios.get(
          `https://izumi.finance/api/v1/farm/compute?chainId=${chainId}`
        )
    );
  return data.data.data;
}

const chains =  {
  'ethereum': 1,
  'bsc': 56,
  'polygon': 137,
  'arbitrum': 42161,
  'aurora': 1313161554,
  'cronos': 25,
};

module.exports = {
  ownTokens: ['IZI', 'IUSD'],
}

Object.keys(chains).forEach(chain => {
    module.exports[chain] = {
      tvl: getTvl(chain, false),
      pool2: getTvl(chain, true),
    }
})

function getTvl(chain, isPool2) {
  return async (_, _b, { [chain]: block }) => {
    const config = await getConfig(chains[chain]);
    var contracts
    if (isPool2){contracts = config.contracts[chain].pool2}
    else {contracts = config.contracts[chain].pools}
    return unwrapNFTs({ chain, block, nftAddress: config.liquidityManagers[chain], config: contracts, fixTokens: config.fixTokens[chain] })
  }
}

module.exports.ethereum.staking = staking('0xb56a454d8dac2ad4cb82337887717a2a427fcd00', '0x9ad37205d608b8b219e6a2573f922094cec5c200')

