const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getChainTransform } = require('../helper/portedTokens')

const config = {
  kava: {
    vaults: {
      BToken: "0xF47BD463e153C7e20Aa044759bac1B6A7c263725",
    },
  },
  ethereum: {
    vaults: {
      BToken: "0x9b64f4842a7fDd16063CdC7cD3ad123C7Bd4918c",
    },
  },
};

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We use the totalSupply() method which includes the interest accrued on the deposited USDC.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const vaults = Object.values(config[chain].vaults);
      const tokensAndOwners = []
      const { output: underlyingAssets } = await sdk.api.abi.multiCall({
        abi: abi.UNDERLYING_ASSET_ADDRESS,
        calls: vaults.map((i) => ({ target: i })),
        chain,
        block,
      });
      underlyingAssets.forEach(i => tokensAndOwners.push([i.output, i.input.target]))
      return sumTokens2({ chain, block, tokensAndOwners })
    },
    borrowed: async (_, _b, { [chain]: block }) => {
      const vaults = Object.values(config[chain].vaults);
      const [
        { output: decimals },
        { output: tokenBalances },
        { output: underlyingAssets },
      ] = await Promise.all([
        'erc20:decimals',
        abi.totalSupply,
        abi.UNDERLYING_ASSET_ADDRESS
      ].map(abi => sdk.api.abi.multiCall({ abi, calls: vaults.map((i) => ({ target: i })), chain, block, })))
      
      const { output: underlyingDecimals } = await sdk.api.abi.multiCall({
        abi: 'erc20:decimals',
        calls: underlyingAssets.map((i) => ({ target: i.output })),
        chain,
        block,
      });
      const { output: underlyingBalances } = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: underlyingAssets.map((i, j) => ({ target: i.output, params: vaults[j] })),
        chain,
        block,
      });
      const transformAddress = await getChainTransform(chain)
      const balances = {}
      tokenBalances.forEach(({ output: total }, i) => {
        const token = transformAddress(underlyingAssets[i].output)
        const decimalChange = underlyingDecimals[i].output - decimals[i].output
        const amountInPool = underlyingBalances[i].output
        const debt = (total * (10 ** decimalChange)) - amountInPool
        if (debt > 0) sdk.util.sumSingleBalance(balances, token, Number(debt).toFixed(0))
      })
      return balances;
    },
  };
});
