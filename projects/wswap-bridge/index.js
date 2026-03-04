const sdk = require("@defillama/sdk");

const COLLATERAL_LOCKERS = {
  ethereum: {
    owner: "0xc74478e6B3285312bfDeF91Aea14D07a7aec8855",
    tokens: [
      // USDT
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      // USDC
      "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    ],
  },
  bsc: {
    owner: "0xBCeD2AF67a3BE7cEd7870FFC386A9759E7481D50",
    tokens: [
      // Binance-Peg XRP
      "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe",
      // Binance-Peg DOGE
      "0xba2ae424d960c26247dd6c32edc70b295c744c43",
      // Binance-Peg SOL
      "0x570a5d26f7765ecb712c0924e4de545b89fd43df",
      // USDC
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      // USDT
      "0x55d398326f99059ff775485246999027b3197955",
    ],
  },
};

module.exports = {
  methodology:
    "Bridge TVL counts collateral locked on source chain bridge contracts (Ethereum and BSC), not bridged token totalSupply on WChain",
  misrepresentedTokens: true,
  wchain: {
    tvl: async (_timestamp, _ethBlock, chainBlocks) => {
      const balances = {};

      for (const [sourceChain, { owner, tokens }] of Object.entries(COLLATERAL_LOCKERS)) {
        const { output } = await sdk.api.abi.multiCall({
          chain: sourceChain,
          block: chainBlocks?.[sourceChain],
          abi: "erc20:balanceOf",
          calls: tokens.map((token) => ({
            target: token,
            params: owner,
          })),
          permitFailure: true,
        });

        output.forEach((res, i) => {
          if (!res?.success || !res?.output || res.output === "0") return;
          sdk.util.sumSingleBalance(balances, `${sourceChain}:${tokens[i]}`, res.output);
        });
      }

      return balances;
    },
  },
};
