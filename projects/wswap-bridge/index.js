const sdk = require("@defillama/sdk");

const SOURCE_CHAIN = "bsc";
const SOURCE_CHAIN_COLLATERAL_LOCKER = "0x68376917dc94A78790b95dFb7dF8Ae1aB8D0CF2d";
const SOURCE_CHAIN_COLLATERAL_TOKENS = [
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
];

module.exports = {
  methodology:
    "Bridge TVL counts collateral locked on source chain bridge contracts (BSC), not bridged token totalSupply on WChain",
  misrepresentedTokens: true,
  wchain: {
    tvl: async (_timestamp, _ethBlock, chainBlocks) => {
      const balances = {};

      const { output } = await sdk.api.abi.multiCall({
        chain: SOURCE_CHAIN,
        block: chainBlocks?.[SOURCE_CHAIN],
        abi: "erc20:balanceOf",
        calls: SOURCE_CHAIN_COLLATERAL_TOKENS.map((token) => ({
          target: token,
          params: SOURCE_CHAIN_COLLATERAL_LOCKER,
        })),
        permitFailure: true,
      });

      output.forEach((res, i) => {
        if (!res?.success || !res?.output || res.output === "0") return;
        sdk.util.sumSingleBalance(balances, `${SOURCE_CHAIN}:${SOURCE_CHAIN_COLLATERAL_TOKENS[i]}`, res.output);
      });

      return balances;
    },
  },
};
