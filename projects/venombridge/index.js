const sdk = require("@defillama/sdk");
const config = require("./config.js");

function totalSupply(venomContracts) {
  return async (timestamp, block, chainBlocks) => {
    try {
      let result = 0;
      for (const { chain, address, decimals } of venomContracts) {
        const { output: totalSupply } = await sdk.api.abi.call({
          target: address,
          abi: "erc20:totalSupply",
          block,
          chain,
        });
        result += totalSupply / 10 ** decimals;
      }

      return { venom: result };
    } catch (error) {
      console.error(`Error getting total supply: ${error.message}`);
      return { venom: 0 };
    }
  };
}

function balanceOf(chain, vaultAddress, tokens) {
  return async (timestamp, block, chainBlocks) => {
    try {
      const balanceCalls = tokens.map(({ address }) => ({
        target: address,
        params: [vaultAddress],
      }));
      const { output: balances } = await sdk.api.abi.multiCall({
        calls: balanceCalls,
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain,
      });

      const result = {};
      for (const { input, output } of balances) {
        const token = tokens.find(({ address }) => address === input.target);
        if (token) {
          result[token.coingeckoId] = output / 10 ** token.decimals;
        }
      }

      return result;
    } catch (error) {
      console.error(`Error getting balances for ${chain}: ${error.message}`);
      return {};
    }
  };
}

module.exports = {
  timetravel: false,
  venom: {
    tvl: totalSupply(config.venomContracts),
  },
  ethereum: {
    tvl: balanceOf("ethereum", config.vaultAddress, config.tokens.ethereum),
  },
  bsc: {
    tvl: balanceOf("bsc", config.vaultAddress, config.tokens.bsc),
  },
  fantom: {
    tvl: balanceOf("fantom", config.vaultAddress, config.tokens.fantom),
  },
  polygon: {
    tvl: balanceOf("polygon", config.vaultAddress, config.tokens.polygon),
  },
  avax: {
    tvl: balanceOf("avax", config.vaultAddress, config.tokens.avax),
  },
};
