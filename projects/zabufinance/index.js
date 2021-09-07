const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");

const FARMING_CONTRACT_ADDRESS = "0xf61b4f980A1F34B55BBF3b2Ef28213Efcc6248C4";

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const lengthOfPool = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: FARMING_CONTRACT_ADDRESS,
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 0; index < lengthOfPool; index++) {
    const lpOrTokens = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: FARMING_CONTRACT_ADDRESS,
        params: index,
        chain: "avax",
        block: chainBlocks["avax"],
      })
    ).output[0];

    const lpOrToken_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: lpOrTokens,
        params: FARMING_CONTRACT_ADDRESS,
        chain: "avax",
        block: chainBlocks["avax"],
      })
    ).output;

    if (
      index == 12 ||
      index == 13 ||
      index == 21 ||
      index == 22 ||
      index == 36 ||
      index == 39 ||
      index == 40
    ) {
      lpPositions.push({
        token: lpOrTokens,
        balance: lpOrToken_bal,
      });
    } else {
      sdk.util.sumSingleBalance(balances, `avax:${lpOrTokens}`, lpOrToken_bal);
    }
  }

  const transformAddress = await transformAvaxAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
};

module.exports = {
  avax: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology:
  'The Zabu Farm Contract Address is used to obtain the balance held in every LP pair and single assets.',
};
