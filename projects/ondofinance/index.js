const sdk = require("@defillama/sdk");
const funds = [
  "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92", // OUSG
];

module.exports = {
  methodology: "Sums Ondo's fund supplies.",
  misrepresentedTokens: true,
  doublecounted: true,
  ethereum: {
    tvl: async (_, __, ___, { api }) => {
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: funds })
      const balances = {}
      supplies.forEach((v, i) => sdk.util.sumSingleBalance(balances, funds[i], v, api.chain))
      return balances
    }
  },
};
