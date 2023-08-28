const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const clqdr = require("./abis/clqdr.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const GRO_BSC = "0x336ed56d8615271b38ecee6f4786b55d0ee91b96";
const LINSPIRIT = "0xc5713B6a0F26bf0fdC1c52B90cd184D950be515C";

const morChains = {
  bsc: {
    pools: [
      "0x13e7a6691fe00de975cf27868386f4ae9aed3cdc",
      "0xc2e8c3c427e0a5baaf512a013516aecb65bd75cb",
    ],

    ignoreAddresses: [],
  },
  avax: {
    pools: [],

    ignoreAddresses: [],
  },
  fantom: {
    pools: [
      "0x30463d33735677b4e70f956e3dd61c6e94d70dfe",
      "0xaebd31E9FFcB222feE947f22369257cEcf1F96CA",
    ],
    ignoreAddresses: [],
  },
};

const morChainsNonStk = {
  bsc: {
    pools: [],
    mcds: [],
    ignoreAddresses: [],
  },
  avax: {
    pools: [],
    mcds: [],
    ignoreAddresses: [],
  },
  fantom: {
    pools: [
      "0x814c66594a22404e101fecfecac1012d8d75c156",
      "0x3f569724cce63f7f24c5f921d5ddcfe125add96b",
    ],
    mcds: [
      "0xe5fb3D583660e57b1f616f89Ae98dfb6e3c37f99",
      "0x726d946BBF3d0E6f9e5078D4F5e1f0014c37288F",
    ],
    ignoreAddresses: [],
  },
};

const transformFrom = async (chain) => {
  if (chain === "bsc") {
    return addr => 'bsc:'+addr
  } else if (chain === "avax") {
    return addr => 'avax:'+addr
  } else {
    return addr => 'fantom:'+addr
  }
};

//*** MOR tvl portion as product of GrowthDefi Protocol ***//
const fetchMorChainTvl = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  chainCustomProcessor
) => {
  const chainConfig = morChains[chain];

  const balances = {};

  const stakeLpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.state,
      calls: chainConfig.pools.map((pool) => ({
        target: pool,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp) => stkLp.output._reserveToken);

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: abi.totalReserve,
      calls: chainConfig.pools.map((pool) => ({
        target: pool,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  const lpPositions = [];

  await Promise.all(
    stkSymbol.map(async (symbol, idx) => {
      if (symbol.output.includes("LP")) {
        lpPositions.push({
          token: stakeLpTokens[idx],
          balance: stakeLpTokens_bal[idx],
        });
      } else {
        const processedTokens = await chainCustomProcessor(
          stakeLpTokens[idx],
          stakeLpTokens_bal[idx],
          symbol.output,
          chainBlocks
        );

        processedTokens.map(({ tokenAddress, tokenBalance }) => {
          sdk.util.sumSingleBalance(
            balances,
            `${chain}:${tokenAddress}`,
            tokenBalance
          );
        });
      }
    })
  );

  const transformAddress = await transformFrom(chain);

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    transformAddress
  );

  return balances;
};

//*** MOR tvl portion as product of GrowthDefi Protocol - for the non strategy contracts ***//
const fetchMorNonStkChainTvl = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  chainCustomProcessor
) => {
  const chainConfig = morChainsNonStk[chain];

  const balances = {};

  const stakeLpTokens = chainConfig.pools;

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: chainConfig.pools.map((pool, idx) => ({
        target: pool,
        params: chainConfig.mcds[idx],
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  const lpPositions = [];

  await Promise.all(
    stkSymbol.map(async (symbol, idx) => {
      if (symbol.output.includes("LP")) {
        lpPositions.push({
          token: stakeLpTokens[idx],
          balance: stakeLpTokens_bal[idx],
        });
      } else {
        const processedTokens = await chainCustomProcessor(
          stakeLpTokens[idx],
          stakeLpTokens_bal[idx],
          symbol.output,
          chainBlocks
        );

        processedTokens.map(({ tokenAddress, tokenBalance }) => {
          sdk.util.sumSingleBalance(
            balances,
            `${chain}:${tokenAddress}`,
            tokenBalance
          );
        });
      }
    })
  );

  const transformAddress = await transformFrom(chain);

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    transformAddress
  );

  return balances;
};

//*** LQDR staked portion as product of GrowthDefi Protocol ***//
const fetchCLQDRStaking = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  chainCustomProcessor
) => {
  const balances = {};

  const stakeLpTokens = ["0x814c66594a22404e101fecfecac1012d8d75c156"];

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: clqdr.totalReserve,
      calls: stakeLpTokens.map((pool, idx) => ({
        target: pool,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  await Promise.all(
    stkSymbol.map(async (symbol, idx) => {
      const processedTokens = await chainCustomProcessor(
        "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9",
        stakeLpTokens_bal[idx],
        "LQDR",
        chainBlocks
      );

      processedTokens.map(({ tokenAddress, tokenBalance }) => {
        sdk.util.sumSingleBalance(
          balances,
          `${chain}:${tokenAddress}`,
          tokenBalance
        );
      });
    })
  );

  return balances;
};

const psmConfig = {
  avax: ["0x88cc23286f1356eb0163ad5bdbfa639416e4168d"],
  bsc: [],
  fantom: ["0xa561fa603bf0b43cb0d0911eeccc8b6777d3401b"],
};

const stableConfig = {
  avax: [ADDRESSES.avax.USDC_e],
  bsc: [ADDRESSES.bsc.BUSD],
  fantom: [],
};

const autoGem = {
  avax: "0x65764167EC4B38D611F961515B51a40628614018",
  bsc: "0xE02CE329281664A5d2BC0006342DC84f6c384663",
  fantom: "",
};

const DAI = {
  avax: ADDRESSES.avax.DAI,
  bsc: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
  fantom: ADDRESSES.fantom.DAI,
};

//*** PSM staked portion as product of GrowthDefi Protocol ***//
const fetchPSMMultiple = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  chainCustomProcessor
) => {
  const balances = {};

  const stakeLpTokens = psmConfig[chain];

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: "erc20:totalSupply",
      calls: stakeLpTokens.map((pool, idx) => ({
        target: pool,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  await Promise.all(
    stkSymbol.map(async (symbol, idx) => {
      const processedTokens = await chainCustomProcessor(
        DAI[chain],
        stakeLpTokens_bal[idx],
        "DAI",
        chainBlocks
      );

      processedTokens.map(({ tokenAddress, tokenBalance }) => {
        sdk.util.sumSingleBalance(
          balances,
          `${chain}:${tokenAddress}`,
          tokenBalance
        );
      });
    })
  );

  return balances;
};

//*** PSM staked portion as product of GrowthDefi Protocol ***//
const fetchPSMSingle = async (
  timestamp,
  ethBlock,
  chainBlocks,
  chain,
  chainCustomProcessor
) => {
  const balances = {};

  const stakeLpTokens = stableConfig[chain];

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: stakeLpTokens.map((pool, idx) => ({
        target: pool,
        params: autoGem[chain],
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: chain,
      block: chainBlocks[chain],
    })
  ).output;

  await Promise.all(
    stkSymbol.map(async (symbol, idx) => {
      const processedTokens = await chainCustomProcessor(
        DAI[chain],
        stakeLpTokens_bal[idx],
        "DAI",
        chainBlocks
      );

      processedTokens.map(({ tokenAddress, tokenBalance }) => {
        sdk.util.sumSingleBalance(
          balances,
          `${chain}:${tokenAddress}`,
          tokenBalance
        );
      });
    })
  );

  return balances;
};

/**
 * BSC-specific tokens processing logic
 *
 * @param {*} address
 * @param {*} balance
 * @param {*} symbol
 * @param {*} chainBlocks
 * @returns
 */
const bscTokensProcessor = async (address, balance, symbol, chainBlocks) => {
  let tokenAddress = address;
  let tokenBalance = balance;

  // Replace govGRO token with GRO (as it's pegged 1:1)
  if (symbol === "govGRO") {
    tokenAddress = GRO_BSC;
  }

  return [{ tokenAddress, tokenBalance }];
};

/**
 * Avax-specific tokens processing logic
 *
 * @param {*} address
 * @param {*} balance
 * @param {*} symbol
 * @param {*} chainBlocks
 * @returns
 */
const avaxTokensProcessor = async (address, balance, symbol, chainBlocks) => {
  let tokenAddress = address;
  let tokenBalance = balance;

  return [{ tokenAddress, tokenBalance }];
};

const ftmTokensProcessor = async (address, balance, symbol, chainBlocks) => {
  let tokenAddress = address;
  let tokenBalance = balance;

  // Replace govGRO token with GRO (as it's pegged 1:1)
  if (symbol === "slinSpirit") {
    tokenAddress = LINSPIRIT;
  }

  return [{ tokenAddress, tokenBalance }];
};

const morBscTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchMorChainTvl(
    timestamp,
    ethBlock,
    chainBlocks,
    "bsc",
    bscTokensProcessor
  );
};

const morAvaxTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchMorChainTvl(
    timestamp,
    ethBlock,
    chainBlocks,
    "avax",
    avaxTokensProcessor
  );
};

const morFTMTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchMorChainTvl(
    timestamp,
    ethBlock,
    chainBlocks,
    "fantom",
    ftmTokensProcessor
  );
};

const morFTMNonStkTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchMorNonStkChainTvl(
    timestamp,
    ethBlock,
    chainBlocks,
    "fantom",
    ftmTokensProcessor
  );
};

const clqdrStakeTvl = (timestamp, ethBlock, chainBlocks) => {
  return fetchCLQDRStaking(
    timestamp,
    ethBlock,
    chainBlocks,
    "fantom",
    ftmTokensProcessor
  );
};

const psmTVLMultipleFTM = (timestamp, ethBlock, chainBlocks) => {
  return fetchPSMMultiple(
    timestamp,
    ethBlock,
    chainBlocks,
    "fantom",
    ftmTokensProcessor
  );
};

const psmTVLMultipleAVAX = (timestamp, ethBlock, chainBlocks) => {
  return fetchPSMMultiple(
    timestamp,
    ethBlock,
    chainBlocks,
    "avax",
    ftmTokensProcessor
  );
};

const psmTVLSingleAVAX = (timestamp, ethBlock, chainBlocks) => {
  return fetchPSMSingle(
    timestamp,
    ethBlock,
    chainBlocks,
    "avax",
    ftmTokensProcessor
  );
};

const psmTVLSingleBSC = (timestamp, ethBlock, chainBlocks) => {
  return fetchPSMSingle(
    timestamp,
    ethBlock,
    chainBlocks,
    "bsc",
    ftmTokensProcessor
  );
};
module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([morBscTvl, psmTVLSingleBSC]),
  },
  avax: {
    tvl: sdk.util.sumChainTvls([
      morAvaxTvl,
      psmTVLMultipleAVAX,
      psmTVLSingleAVAX,
    ]),
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([
      morFTMTvl,
      morFTMNonStkTvl,
      clqdrStakeTvl,
      psmTVLMultipleFTM,
    ]),
  },
  methodology:
    "We count liquidity on MOR through MasterChef and Staking Contracts",
};
