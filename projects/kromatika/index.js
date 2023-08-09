const sdk = require("@defillama/sdk");
const { sumTokensExport } = require('../helper/unwrapLPs')
const abi = require("./abi.json");

const contracts = {
  optimism: {
    KROM: "0xf98dcd95217e15e05d8638da4c91125e59590b07",
    position: "0x7314Af7D05e054E96c44D7923E68d66475FfaAb8",
  },
  ethereum: {
    KROM: "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789",
    position: "0xd1fdf0144be118c30a53e1d08cc1e61d600e508e",
  },
  arbitrum: {
    KROM: "0x55ff62567f09906a85183b866df84bf599a4bf70",
    position: "0x02c282f60fb2f3299458c2b85eb7e303b25fc6f0",
  },
   polygon: {
     KROM: "0x14Af1F2f02DCcB1e43402339099A05a5E363b83c",
     position: "0x03F490aE5b59E428E6692059d0Dca1B87ED42aE1",
   },
};

async function opTvl(api, position) {
  const orderIds = await api.fetchList({ target: position, lengthAbi: 'uint256:totalSupply', itemAbi: abi.tokenByIndex, })
  return getTvl({ api, position, orderIds })
}

async function getTvl({ api, position, orderIds }) {
  const orderRes = await api.multiCall({ abi: abi.orders, calls: orderIds, target: position })
  const balances = {}
  orderRes.map(({ token0, token1, tokensOwed0, tokensOwed1, }) => {
    sdk.util.sumSingleBalance(balances, token0, tokensOwed0, api.chain)
    sdk.util.sumSingleBalance(balances, token1, tokensOwed1, api.chain)
  })
  return balances
}

module.exports = {
  methodology:
    "Kromatika handles Uniswap-v3 positions for their users who submit limit orders - TVL is amounts of tokens of each LP as well as KROM held by the contract to pay for fees",
};

Object.keys(contracts).forEach(chain => {
  const {KROM, position} = contracts[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      if (chain === 'optimism') return opTvl(api, position)
      const orderIds = []
      const monitors = await api.fetchList({  lengthAbi: 'uint256:monitorsLength', target: position, itemAbi: abi.monitors })
      console.log(monitors, chain)
      for (const monitor of monitors) {
        const _orderIds = await api.fetchList({ target: monitor, lengthAbi: 'uint256:getTokenIdsLength', itemAbi: abi.tokenIds, })
        orderIds.push(..._orderIds)
      }
      return getTvl({ api, position, orderIds })
    },
    staking: sumTokensExport({ owner: position, tokens: [KROM]})
  }
})
// UniswapV3Pool NonfungiblePositionManager has a low level mint method
// this is what UniswapNFT uses and Kromatikaa is also using it; so in a way Kromatika is a different NFT LP manager for UniswapV3 but for limit orders
// users gets Kromatika NFT for their limit position;  same as they get Uniswap NFT for their LP; so it is a similar impl from Uniswap, but extended to support limit orders