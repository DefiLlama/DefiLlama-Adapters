const sdk = require('@defillama/sdk')
const { aaveExports } = require("../helper/aave");

const config = {
  hyperliquid: ["0xf8b130AaF759C24d91BeC7Dd64e4A82D2CF51194", "0x022F164dDBa35a994ad0f001705e9c187156E244"]
};

const data = {};
Object.keys(config).forEach((chain) => {
  const chainExports = config[chain].map((address) => aaveExports(chain, undefined, undefined, [address]))
  data[chain] = {
    tvl: sdk.util.sumChainTvls(chainExports.map(i => i.tvl)),
    borrowed: sdk.util.sumChainTvls(chainExports.map(i => i.borrowed))
  }
});

module.exports = data;

