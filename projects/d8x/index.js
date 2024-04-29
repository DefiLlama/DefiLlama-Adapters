const { sumUnknownTokens } = require('../helper/unknownTokens')
const abi = require("./abi-poolInfo.json");

const config = {
  polygon_zkevm: { factory: "0xaB7794EcD2c8e9Decc6B577864b40eBf9204720f", fromBlock: 6182628 },
  xlayer: { factory: "0xb24dB543749277E8625a59C061aE7574C8235475", fromBlock: 385678 },
};

async function tvl(api) {
  const { factory } = config[api.chain];
  const exchangeInfo = await api.call({
    abi: abi.getPoolStaticInfo,
    target: factory,
    params: [1, 255],
    useDefaultCoreAssets: true,
  });

  const marginTokens = exchangeInfo[2];
  return sumUnknownTokens({ api, owner: factory, tokens: marginTokens, useDefaultCoreAssets: true });
}

// Build the exports object
const exportsData = {
  methodology: "adds up the balances of all liquidity pools in the D8X exchange",
};

Object.keys(config).forEach(chain => {
  exportsData[chain] = {
    tvl: (api) => tvl(api),
    start: config[chain].fromBlock,
  };
});

module.exports = exportsData;