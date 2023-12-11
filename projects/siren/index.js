const abis = require('../helper/abis/siren.json');
const sdk = require('@defillama/sdk');
const { sumTokens2, sumTokens } = require("../helper/unwrapLPs");
const { getLogs, getAddress } = require('../helper/cache/getLogs');
const config = {
  arbitrum: {hedgePools: ["0x07835De4f96164758fE68283a5466E066c1885DC"]},
  polygon: { fromBlock: 17842705, factory: '0x0cdaa64b47474e02cdfbd811ec9fd2d265cd3a0a', vault: '0xc40a31bd9fed1569ce647bb7de7ff93facca36e9', },
  ethereum: { fromBlock: 11272343, factory: '0xb8623477ea6f39b63598ceac4559728dca81af63', vault: '0x7b63ecbc78402553a2d7f01ea3d10079c3aaa469', },
}
Object.keys(config).forEach(chain => {
  const hedgePools = config[chain].hedgePools;
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      if(chain == 'arbitrum') {
        let balances = {}
        for (const hedgePool of hedgePools) {
          const totalValueCached = (
            await sdk.api.abi.call({
              target: hedgePool,
              abi: abis.getTotalPoolValueCached,
              chain: 'arbitrum'
            })
          ).output;
          const collateralToken = (
            await sdk.api.abi.call({
              abi: abis.collateralToken,
              target: hedgePool,
              chain: 'arbitrum'
            })
          ).output;

          balances[`arbitrum:${collateralToken}`] = parseInt(totalValueCached)
        }
        return sumTokens2({ balances, owner: "0x07835De4f96164758fE68283a5466E066c1885DC" })
      }
      else {
        const { factory, fromBlock, vault, } = config[chain]
        const logs = await getLogs({
          api,
          target: factory,
          topics: ['0xa128ec36b78fa37f9f3e10bf2451c665a4e9fb1339f9f0e6fef45b343e73dcb1'],
          fromBlock,
        })
        const pools = logs.map(i => getAddress(i.data))
        const tokens = await api.multiCall({  abi: 'address:collateralToken', calls: pools})
        return sumTokens2({ api, tokensAndOwners: tokens.map((v, i) => [[v, pools[i]], [v, vault]]).flat()})
      }
    }
  }
});
