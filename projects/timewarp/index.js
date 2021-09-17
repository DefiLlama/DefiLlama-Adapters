const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { transformBscAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const TimeWarpPool_LP_UNISWAP_ETH =
  "0x55c825983783c984890bA89F7d7C9575814D83F2";
const TimeWarpPool_LP_PANCAKE_BSC =
  "0xC48467BA55cF0B777978F19701329c87949EFD3C";

const TimeWarpPool_TIME_ETH = "0xa106dd3Bc6C42B3f28616FfAB615c7d494Eb629D";
const TimeWarpPool_TIME_BSC = "0x59f2757Ae3a1BAa21e4f397a28985Ceb431c676b";

const calcTvl = async (balances, chain, block, TimeWarpPool) => {
  const erc20TokenOrLp = (
    await sdk.api.abi.call({
      abi: abi.erc20Deposit,
      target: TimeWarpPool,
      chain,
      block,
    })
  ).output;

  const transformAddress = await transformBscAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    TimeWarpPool == TimeWarpPool_TIME_ETH ||
      TimeWarpPool == TimeWarpPool_TIME_BSC
      ? [[erc20TokenOrLp, false]]
      : [[erc20TokenOrLp, true]],
    [TimeWarpPool],
    block,
    chain,
    chain == "bsc" ? transformAddress : (addr) => addr
  );
};

/*** Staking of native token (TIME) on Ethereum and Binance TVL portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  //  --- Staking of native token TIME on Ethereum ---
  await calcTvl(
    balances,
    "ethereum",
    chainBlocks["ethereum"],
    TimeWarpPool_TIME_ETH
  );

  //  --- Staking of native token TIME on Binance ---
  await calcTvl(balances, "bsc", chainBlocks["bsc"], TimeWarpPool_TIME_BSC);

  return balances;
};

/*** Ethereum TVL Portion ***/
const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "ethereum",
    chainBlocks["ethereum"],
    TimeWarpPool_LP_UNISWAP_ETH
  );

  return balances;
};

/*** Binance TVL Portion ***/
const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    TimeWarpPool_LP_PANCAKE_BSC
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  ethereum: {
    tvl: ethTvl,
  },
  binance: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, ethTvl]),
  methodology: `We count as TVL the staking Lps on Ethereum (TIME-ETH Sushiswap LP)
   and Binance (TIME-BNB Pancake LP) networks threw their TimeWarpPool contracts; and
   we count the staking native token (TIME) on both netwarks, separated from tvl`,
};
