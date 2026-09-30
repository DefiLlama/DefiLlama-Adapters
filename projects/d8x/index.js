const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "getPoolStaticInfo": "function getPoolStaticInfo(uint8 _poolFromIdx, uint8 _poolToIdx) external view returns (uint24[][] memory, address[] memory, address[] memory, address _oracleFactoryAddress)",
    "getSupportedTokens": "function getSupportedTokens() view returns (address[] memory)"
  };
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  polygon_zkevm: { factory: "0x900DfC161C34656a9D9c43307F92255C2aa06162" },
  xlayer: { factory: "0xb24dB543749277E8625a59C061aE7574C8235475" },
  arbitrum: { factory: "0x8f8BccE4c180B699F81499005281fA89440D1e95" },
  // proxy implementation removed (Proxy:Implementation not found), pools wound down - count what the contract still holds
  base : {factory: "0x7F3A4A9e5BB469F0F4977AA390760aF9EFCCd406", staticTokens: [ADDRESSES.base.USDC] },
  berachain: {
    factory: "0xb6329c7168b255Eca8e5c627b0CCe7A5289C8b7F", 
    compositeToken: "0xA8655EF2354d679E2553C10b2d59a61C4345aF51"
  },
};

async function tvl(api) {
  const { factory, compositeToken, staticTokens } = config[api.chain];
  if (staticTokens) return sumTokens2({ api, owner: factory, tokens: staticTokens });
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
