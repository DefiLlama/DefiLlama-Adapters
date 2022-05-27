const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const axios = require("axios");
const solana = require("../helper/solana");

const PECO_ADDRESS = "0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978";
const DFI_ADDRESS = "0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978";
const SOLI_ADDRESS = "8JnNWJ46yfdq8sKgT1Lk4G7VWkAA8Rhh7LhqgJ6WY41G";

async function getSolanaTokenRate(address) {
  return await axios.get(
    "https://lima-api.amun.com/tokenRate/APygy51vntbQQsYmgkF1CeMsAn5Tv1rsVUB6nee3wJpY?chain=solana&address=" +
      address
  );
}

function chainTvl(chain, tokens) {
  if (chain === "solana") {
    return async (timestamp, ethBlock, chainBlocks) => {
      const balances = {};
      for (const token of tokens) {
        const rate = await getSolanaTokenRate(token);
        const tokenSupply = await solana.getTokenSupply(token);
        const balance = Math.trunc(rate.data.value * tokenSupply);

        sdk.util.sumSingleBalance(balances, chain + ":" + token, balance);
      }

      let total = 0;
      for (var key in balances) {
        total += balances[key];
      }

      return total;
    };
  }

  return async (timestamp, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const balances = {};
    for (const address of tokens) {
      const underlyings = await sdk.api.abi.call({
        block,
        target: address,
        abi: abi.getTokens,
        chain,
      });
      for (const token of underlyings.output) {
        const held = await sdk.api.erc20.balanceOf({
          block,
          target: token,
          owner: address,
          chain,
        });
        sdk.util.sumSingleBalance(balances, chain + ":" + token, held.output);
      }
    }

    return balances;
  };
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: chainTvl("ethereum", [DFI_ADDRESS]),
  },
  polygon: {
    tvl: chainTvl("polygon", [PECO_ADDRESS]),
  },
  solana: {
    tvl: chainTvl("solana", [SOLI_ADDRESS]),
  },
  methodology: `Amun Tokens has three investment strategies available, which are the Defi Token Index(DFI), the Polygon Ecosystem Index (PECO) and Solana Ecosystem Index (SOLI). Each strategy has its own address where the underlying tokens are held. To get the TVL for the DFI and PECO, first of all, an on-chain call is made using the function 'tvl()', which first retrieves each token that is held within the strategy addresses and then calls 'balanceOf()' to get the balances of these tokens which are added and used as TVL. For SOLI, getTokenSupply helper method is called to get the total supply of the token, and then multiplied at the current market rate of the token, retrieved from our API endpoint.`,
};
