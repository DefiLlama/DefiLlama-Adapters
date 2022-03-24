const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const { returnEthBalance } = require("../helper/utils");
const { getChainTransform } = require("../helper/portedTokens");

const bridgeContracts = {
  ethereum: ["0x2A5c2568b10A0E826BfA892Cf21BA7218310180b"],
  polygon: ["0x2A5c2568b10A0E826BfA892Cf21BA7218310180b"],
  avax: ["0x2A5c2568b10A0E826BfA892Cf21BA7218310180b"],
};

// Tokens on the bridge contracts
const bridgeTokens = [
  {
    // USDT
    ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
  {
    // USDC
    ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    avax: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  },
  {
    // WETH
    polygon: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    avax: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
  },
  {
    // BICO
    ethereum: "0xF17e65822b568B3903685a7c9F496CF7656Cc6C2",
    polygon: "0x91c89A94567980f0e9723b487b0beD586eE96aa7",
  },
];

function chainTvl(chain) {
  return async (time, _, chainBlocks) => {
    const block = await getBlock(time, chain, chainBlocks, true);
    const balances = {};
    await Promise.all(
      bridgeTokens.map(async (token) => {
        if (token[chain] === undefined) {
          return;
        }

        const chainTransform = await getChainTransform(chain);
        const tokenAddress = await chainTransform(token[chain]);

        if (bridgeContracts[chain] !== undefined) {
          await sumTokens(
            balances,
            bridgeContracts[chain].map((b) => [token[chain], b]),
            block,
            chain,
            () => tokenAddress
          );
        }
      })
    );

    if (chain === "ethereum") {
      const ethBal = await returnEthBalance(bridgeContracts[chain][0]);
      sdk.util.sumSingleBalance(balances, "ethereum", ethBal);
    }
    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  doublecounted: false,
  methodology:
    "Biconomy TVL is the USD value of token balances in the Hyphen 2.0 contracts.",
  ethereum: {
    tvl: chainTvl("ethereum"),
  },
  polygon: {
    tvl: chainTvl("polygon"),
  },
  avalanche: {
    tvl: chainTvl("avax"),
  },
};
