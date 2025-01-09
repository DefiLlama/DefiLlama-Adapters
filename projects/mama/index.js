const { uniV3Export } = require("../helper/uniswapV3");
const { getUniqueAddresses } = require("../helper/utils");

module.exports = uniV3Export({
  polygon: {
    factory: "0xE7aE959bbC94BDF2E9FF28a214840aB3285d7765",
    fromBlock: 46977039,
    filterFn,
  }
});

async function filterFn(api, logs) {
  let tokens = logs.map(i => [i.token0, i.token1]).flat()
  tokens = getUniqueAddresses(tokens)
  const names = await api.multiCall({  abi: 'string:name', calls: tokens, permitFailure: true })
  return tokens.filter((_, i) => typeof names[i] == 'string' && /aryze/i.test(names[i]))
}