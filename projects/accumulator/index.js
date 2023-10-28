const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");
let _response;

function fetchChain(chainId) {
  return async () => {
    if (!_response)
      _response = utils.fetchURL("https://newapi.potluckprotocol.com/tvl");
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      tvl += Number(chain[vault]);
    }
    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`);
    }

    return toUSDTBalances(tvl);
  };
}

const chains = {
  shimmer: 148,
};

module.exports = {
  timetravel: false,
  methodology: 'TVL data is pulled from the Accumulator API',
  ...Object.fromEntries(
    Object.entries(chains).map((chain) => [
      chain[0],
      {
        tvl: fetchChain(chain[1]),
      },
    ])
  ),
};
