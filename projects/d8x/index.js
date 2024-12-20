const abi = require("./abi-poolInfo.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  polygon_zkevm: { factory: "0x900DfC161C34656a9D9c43307F92255C2aa06162" },
  xlayer: { factory: "0xb24dB543749277E8625a59C061aE7574C8235475" },
  arbitrum: { factory: "0x8f8BccE4c180B699F81499005281fA89440D1e95" },
};

async function tvl(api) {
  const { factory } = config[api.chain];
  const exchangeInfo = await api.call({
    abi: abi.getPoolStaticInfo,
    target: factory,
    params: [1, 255],
  });

  const marginTokens = exchangeInfo[2];
  return sumTokens2({ api, owner: factory, tokens: marginTokens });
}

module.exports = {
  methodology:
    "adds up the balances of all liquidity pools in the D8X exchange",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
