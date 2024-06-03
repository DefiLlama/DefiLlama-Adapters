const ADDRESSES = require('../helper/coreAssets.json')
const { call, parseAddress } = require('../helper/chain/starknet')
const { getConfig } = require('../helper/cache')

const totalAssetsAbi = {
  "name": "total_assets",
  "type": "function",
  "inputs": [],
  "outputs": [
    {
      "name": "totalAssets",
      "type": "Uint256"
    }
  ],
  "stateMutability": "view"
}



async function tvl(api) {
    const strategyData = await getConfig('nimbora', "https://backend.nimbora.io/yield-dex/strategies")
    for (let index = 0; index < strategyData.length; index++) {
      const strategyInfo = strategyData[index];
      const underlying = parseAddress(strategyInfo.underlying) == "0x05574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad" ? ADDRESSES.starknet.DAI : parseAddress(strategyInfo.underlying);
      const strategyTvl = await call({ target: strategyInfo.tokenManager, abi: totalAssetsAbi });
      api.add(underlying, strategyTvl)
    }
}

module.exports = {
    methodology: 'Computed by summing the total assets held by each strategy.',
    starknet: {
        tvl
    },
}
