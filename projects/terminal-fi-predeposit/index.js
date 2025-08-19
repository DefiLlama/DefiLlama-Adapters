const { sumSingleBalance } = require('@defillama/sdk/build/generalUtil');
const ADDRESSES = require('../helper/coreAssets.json');

const receiptTokens = {
  // tUSDe → USDe (Ethena USD)
  '0xA01227A26A7710bc75071286539E47AdB6DEa417': ADDRESSES.ethereum.USDe,

  // tETH → WETH (Wrapped Ether)
  '0xa1150cd4A014e06F5E0A6ec9453fE0208dA5adAb': ADDRESSES.ethereum.WETH,

  // tBTC → WBTC (Wrapped Bitcoin)
  '0x6b6b870C7f449266a9F40F94eCa5A6fF9b0857E4': ADDRESSES.ethereum.WBTC,
};

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const balances = {};

      for (const [receiptToken, underlyingToken] of Object.entries(receiptTokens)) {
        const [receiptDecimals, underlyingDecimals, totalSupplyRaw] = await Promise.all([
          api.call({ abi: 'erc20:decimals', target: receiptToken }),
          api.call({ abi: 'erc20:decimals', target: underlyingToken }),
          api.call({ abi: 'erc20:totalSupply', target: receiptToken }),
        ]);

        const totalSupply = BigInt(totalSupplyRaw.toString());
        const scaleDiff = receiptDecimals - underlyingDecimals;

        let adjustedSupply = totalSupply;

        // Receipt token has more decimals than underlying token
        if (scaleDiff > 0) {
          adjustedSupply = totalSupply / BigInt(10 ** scaleDiff);
        }
        // Receipt token has fewer decimals than underlying token
        else if (scaleDiff < 0) {
          adjustedSupply = totalSupply * BigInt(10 ** scaleDiff);
        }

        sumSingleBalance(balances, underlyingToken, adjustedSupply.toString());
      }

      return balances;
    },
  },
};