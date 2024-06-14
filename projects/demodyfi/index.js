const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const wGLMR = ADDRESSES.moonbeam.WGLMR;
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

async function dmodBscStakingPool(timestamp, block, chainBlocks) {
  const stakingBalance = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        chain: "bsc",
        target: "0x002D8563759f5e1EAf8784181F3973288F6856e4",
        params: ["0xc94e085E2E2D92A950fa4A6B923263C0B47c6dBa"],
        block: chainBlocks["bsc"],
      })
    ).output
  );

  const decimals = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:decimals",
        chain: "bsc",
        target: "0x002D8563759f5e1EAf8784181F3973288F6856e4",
        params: [],
        block: chainBlocks["bsc"],
      })
    ).output
  );

  return { 'demodyfi': stakingBalance.div(new BigNumber(10).pow(decimals)).toFixed(0) };
}
async function dmodEthereumStakingPool(timestamp, block, chainBlocks) {
  const stakingBalance = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        chain: "ethereum",
        target: ADDRESSES.moonbeam.WGLMR,
        params: ["0x024D59Ac0Bb03dEd28B9A16cd50B3d242B43a683"],
        block
      })
    ).output
  );

  const decimals = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:decimals",
        chain: "ethereum",
        target: ADDRESSES.moonbeam.WGLMR,
        params: [],
        block
      })
    ).output
  );

  return { 'demodyfi': stakingBalance.div(new BigNumber(10).pow(decimals)).toFixed(0) };
}
async function dmodBscLPPool(timestamp, block, chainBlocks) {
  const transform = i => `bsc:${i}`;
  const balances = {};

  const lpTokenbalance = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        chain: "bsc",
        target: "0x0f35d854C267D29C0E418F561b75aE09B9E413D4",
        params: ["0xc94e085E2E2D92A950fa4A6B923263C0B47c6dBa"],
        block: chainBlocks["bsc"],
      })
    ).output
  );

  await unwrapUniswapLPs(
    balances,
    [
      {
        balance: lpTokenbalance,
        token: "0x0f35d854C267D29C0E418F561b75aE09B9E413D4",
      },
    ],
    chainBlocks["bsc"],
    "bsc",
    transform
  );

  return balances;
}
async function dmodEthereumLPPool(timestamp, block, chainBlocks) {
  const balances = {};

  const lpTokenbalance = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        chain: "ethereum",
        target: "0xD5B1Cd8D245A93E0697707AEe82497388508b132",
        params: ["0x024D59Ac0Bb03dEd28B9A16cd50B3d242B43a683"],
        block
      })
    ).output
  );

  await unwrapUniswapLPs(
    balances,
    [
      {
        balance: lpTokenbalance,
        token: "0xD5B1Cd8D245A93E0697707AEe82497388508b132",
      },
    ],
    block,
    "ethereum"
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: () => ({}),
    staking: dmodEthereumStakingPool,
    pool2: dmodEthereumLPPool
  },
  bsc: {
    tvl: () => ({}),
    staking: dmodBscStakingPool,
    pool2: dmodBscLPPool
  },
  moonbeam: {
    tvl: getUniTVL({ factory: '0x61999fAb7fdcEe1B26b82b5c2f825BCC8F8c2458', useDefaultCoreAssets: true }),
  },
};
// node test.js projects/demodyfi/index.js