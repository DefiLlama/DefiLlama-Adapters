const abi = require("./abi-poolInfo.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  polygon_zkevm: { factory: "0x900DfC161C34656a9D9c43307F92255C2aa06162" },
  xlayer: { factory: "0xb24dB543749277E8625a59C061aE7574C8235475" },
  arbitrum: { factory: "0x8f8BccE4c180B699F81499005281fA89440D1e95" },
  base : {factory: "0x7F3A4A9e5BB469F0F4977AA390760aF9EFCCd406"},
  berachain: {
    factory: "0xb6329c7168b255Eca8e5c627b0CCe7A5289C8b7F", 
    compositeToken: "0xA8655EF2354d679E2553C10b2d59a61C4345aF51"
  },
};

async function tvl(api) {
  const { factory, compositeToken } = config[api.chain];
  const exchangeInfo = await api.call({
    abi: abi.getPoolStaticInfo,
    target: factory,
    params: [1, 255],
  });

  const marginTokens = exchangeInfo[2].filter((tokenAddr) => (tokenAddr !== compositeToken));

  if (!compositeToken) {
    return sumTokens2({ api, owner: factory, tokens: marginTokens });
  } else {
    // pool uses pool-specific composite token 
    const supportedTokens = await api.call({
      abi: abi.getSupportedTokens,
      target: compositeToken,
    })
    return sumTokens2({api, owners: [factory, compositeToken], tokens: [...marginTokens, ...supportedTokens]});

  }
}

module.exports = {
  methodology:
    "adds up the balances of all liquidity pools in the D8X exchange",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
