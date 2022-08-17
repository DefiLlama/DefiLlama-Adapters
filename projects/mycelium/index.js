const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const Vault = require("./Vault.json");

const VAULT_ADDRESS = "0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855";

async function arbitrumTVL(timestamp, block, chainBlocks) {
  const balances = {};

  const { output: numTokens } = await sdk.api.abi.call({
    target: VAULT_ADDRESS,
    abi: Vault.allWhitelistedTokensLength,
    chain: "arbitrum",
    block: chainBlocks["arbitrum"],
  });

  const { output: tokenAddresses } = await sdk.api.abi.multiCall({
    abi: Vault.allWhitelistedTokens,
    calls: Array.apply(null, { length: numTokens }).map((_, i) => ({
      target: VAULT_ADDRESS,
      params: [i],
    })),
    chain: "arbitrum",
    block: chainBlocks["arbitrum"],
  });

  const tokenBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokenAddresses.map(data => ({
      target: data.output,
      params: [VAULT_ADDRESS],
    })),
    chain: 'arbitrum',
    block: chainBlocks["arbitrum"],
  });

  const transform = await transformArbitrumAddress();
  sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);

  return balances;
}

module.exports = {
  arbitrum: {
    tvl: arbitrumTVL,
  }
};