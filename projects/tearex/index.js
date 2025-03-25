const { getConfig } = require("../helper/cache");

const abi = require("./abi.json");
const config = require("./config.json");

function getPoolAddress(product, chain) {
  return config[product][chain];
}

const chains = ["sei"];
const products = ["alpha"];

chains.forEach((chain) => {
  products.forEach((product) => {
    module.exports[chain] = {
      tvl: async (api) => {
        const pools = getPoolAddress(product, chain);
        const tokens = await api.multiCall({
          abi: abi.underlyingAsset,
          calls: pools,
        });
        const underlyingDecimals = await api.multiCall({
          abi: abi.decimals,
          calls: tokens,
        });
        const decimals = await api.multiCall({
          abi: abi.decimals,
          calls: pools,
        });
        const multipliers = await api.multiCall({
          abi: abi.RATE_MULTIPLIER,
          calls: pools
        });
        const rates = await api.multiCall({
          abi: abi.getConversionRates,
          calls: pools,
        });
        const totalSupplies = await api.multiCall({
          abi: abi.totalSupply,
          calls: pools
        });
        const balances = totalSupplies.map(
          (totalSupply, index) => {
            const dividend = BigInt(totalSupply) * BigInt(rates[index].suppliedRate) * 10n ** BigInt(underlyingDecimals[index]);
            const divisor = BigInt(multipliers[index]) * 10n ** BigInt(decimals[index]);
            return (dividend / divisor).toString()
          }
        );

        api.addTokens(tokens, balances);
      }
    }
  });
});

module.exports.misrepresentedTokens = true