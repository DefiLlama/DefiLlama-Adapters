const sdk = require("@defillama/sdk");
const funds_eth = [
  "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92", // OUSG_ETH
];
const funds_polygon = [
  "0xbA11C5effA33c4D6F8f593CFA394241CfE925811", // OUSG_POLY
]

module.exports = {
  methodology: "Sums Ondo's fund supplies.",
  misrepresentedTokens: true,
  doublecounted: true,
  ethereum: {
    tvl: async (_, __, ___, { api }) => {
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: funds_eth })
      const balances = {}
      supplies.forEach((v, i) => sdk.util.sumSingleBalance(balances, funds_eth[i], v, api.chain))
      return balances
    }
  },
  polygon: {
    tvl: async (_, __, ___, { api }) => {
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: funds_polygon })
      const balances = {}
      supplies.forEach((v, i) => sdk.util.sumSingleBalance(balances, funds_polygon[i], v, api.chain))
      return balances
    }
  }
};