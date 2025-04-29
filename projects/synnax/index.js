const marketsJSON = require('./markets.json');
const abi = require('./abi.json');

const boxAddresses = {
  "sei": ["0xcfe1235b85F533A294efd3826cE15Da6bE21161f"],
};

async function tvl(api) {
  const { chain } = api
  const marketsArray = [];

  for (const [marketContract, lockedToken] of Object.entries(marketsJSON[chain])) {
    marketsArray.push([lockedToken, marketContract]);
  }

  const calls = boxAddresses[chain].map(boxAddress => marketsArray.map((market) => ({
    target: boxAddress,
    params: market
  }))).flat()

  const tokens = boxAddresses[chain].map(_ =>
    marketsArray.map(([lockedToken]) => lockedToken)
  ).flat()

  const balances = await api.multiCall({ calls, abi: abi.balanceOf, })
  api.addTokens(tokens, balances)
}

module.exports = {
  sei: {
    tvl,
  }
};
