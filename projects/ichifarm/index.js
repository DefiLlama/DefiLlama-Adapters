const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { stakings } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const { requery } = require('./../helper/getUsdUniTvl');
const { sumTokens2, unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')

const ichi = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";
const xIchi = "0x70605a6457B0A8fBf1EEE896911895296eAB467E";
const tokenFactory = "0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a";
const farmContract = "0x275dFE03bc036257Cd0a713EE819Dbd4529739c8";
const ichiLending = "0xaFf95ac1b0A78Bd8E4f1a2933E373c66CC89C0Ce";

const unilps = [
  // SLP
  "0x9cD028B1287803250B1e226F0180EB725428d069",
  // UNI-V2 lP
  "0xd07D430Db20d2D7E0c4C11759256adBCC355B20C"
]
const poolWithTokens = [
  // BANCOR
  ["0x4a2F0Ca5E03B2cF81AebD936328CF2085037b63B", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"]],
  // ONE INCH
  ["0x1dcE26F543E591c27717e25294AEbbF59AD9f3a5", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x111111111117dC0aa78b770fA6A738034120C302"]],
  // BALANCER
  ["0x58378f5F8Ca85144ebD8e1E5e2ad95B02D29d2BB", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]]
]

async function getVaultTvl(balances, vaults, tokenAtIndex, block) {
  let allOneTokens = []
  tokenAtIndex.map(p => {
    allOneTokens.push(p.output.toLowerCase());
  })

  const token0s = (await sdk.api.abi.multiCall({
    calls: vaults.map(p => ({
      target: p
    })),
    abi: abi["token0"],
    block
  })).output;

  const token1s = (await sdk.api.abi.multiCall({
    calls: vaults.map(p => ({
      target: p
    })),
    abi: abi["token1"],
    block
  })).output;

  const totalAmounts = (await sdk.api.abi.multiCall({
    calls: vaults.map(p => ({
      target: p
    })),
    abi: abi["getTotalAmounts"],
    block
  })).output;

  await requery(totalAmounts, 'ethereum', block, abi["getTotalAmounts"]);
  await requery(token0s, 'ethereum', block, abi["token0"]);
  await requery(token1s, 'ethereum', block, abi["token1"]);

  for (let i = 0; i < vaults.length; i++) {
    const tokens = [
      token0s[i].output.toLowerCase(),
      token1s[i].output.toLowerCase()
    ]

    const bals = [
      totalAmounts[i].output[0],
      totalAmounts[i].output[1]
    ]

    for (let j = 0; j < 2; j++) {
      if (allOneTokens.includes(tokens[j])) {
        break;
      }
      sdk.util.sumSingleBalance(balances, tokens[j], bals[j]);
    }
  }
}

async function getOneTokens(block) {
  const tokenCount = (await sdk.api.abi.call({
    target: tokenFactory,
    abi: abi.oneTokenCount,
    block
  })).output;

  const tokenAtIndex = (await sdk.api.abi.multiCall({
    calls: [...Array(tokenCount).keys()].map((i) => ({
      target: tokenFactory,
      params: [i]
    })),
    abi: abi.oneTokenAtIndex,
    block
  })).output;

  return tokenAtIndex
}

async function getVaults(block) {
  const estVaultCount = 50;
  const vaults = (await sdk.api.abi.multiCall({
    block,
    calls: [...Array(estVaultCount).keys()].map((i) => ({
      target: '0x5a40DFaF8C1115196A1CDF529F97122030F26112',
      params: [i],
    })),
    abi: abi.allVaults,
  })).output.filter(v => v.success == true).map(v => v.output);
  return vaults;
}

async function tvl(timestamp, block) {
  let balances = {};

  const vaults = await getVaults(block)
  const ichiTokens = await getOneTokens(block)
  
  await getVaultTvl(balances, vaults, ichiTokens, block);
  
  for (let t of ichiTokens) {
    delete balances[t]
  }
  return balances;
}

async function getPoolTvl(balances, poolWithTokens, block) {
  for (let i = 0; i < poolWithTokens.length; i++) {
    const pool = poolWithTokens[i][0];
    const tokens = poolWithTokens[i][1];
    const poolBalances = (await sdk.api.abi.multiCall({
      calls: tokens.map(p => ({
        target: p,
        params: pool
      })),
      abi: "erc20:balanceOf",
      block
    })).output;
    poolBalances.forEach(p => {
      sdk.util.sumSingleBalance(balances, p.input.target, p.output);
    })
  }
}

async function pool2(timestamp, block) {
  let balances = {};

  const unilpBalance = (await sdk.api.abi.multiCall({
    calls: unilps.map(p => ({
      target: p,
      params: farmContract
    })),
    abi: "erc20:balanceOf",
    block
  })).output;

  let lpPositions = [];
  unilpBalance.forEach(p => {
    lpPositions.push({ token: p.input.target, balance: p.output });
  })

  await unwrapUniswapLPs(balances, lpPositions, block);
  await getPoolTvl(balances, poolWithTokens, block);

  return balances;
}

async function polygonTvl(_, _b, { polygon: block }){
  const chain = 'polygon'
  const tokensAndOwners = [
    // oneBTC mint
    ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174', '0x1f194578e7510A350fb517a9ce63C40Fa1899427'],
    ['0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', '0x1f194578e7510A350fb517a9ce63C40Fa1899427'],
    // BTC pool
    ['0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', '0x61F7d1F537E959d62265a76Bf1ac40EB3E338De7'], 

    // USDC pool
    ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174', '0x499277a14d1eDB5583dd070A447dEDA19E7aBf85'], 

    // oneBTC Strategy
    ['0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', '0x339d2bb734bbe105b48a2983d504378cded3093b'], 
    ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174', '0x339d2bb734bbe105b48a2983d504378cded3093b'], 
    ['0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', '0x6980e5afafec8c9c5f039d0c1a8ccfa6cefb9393'], 
    ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174', '0x6980e5afafec8c9c5f039d0c1a8ccfa6cefb9393'], 
  ]

  return sumTokens2({ chain, block, tokensAndOwners, })
}

module.exports = {
  methodology: "Tokens deposited to mint oneTokens, Angel and HODL vaults excluding oneTokens",
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    pool2,
    staking: stakings([xIchi, ichiLending] , ichi)
  },
  polygon: {
    tvl: polygonTvl
  }
} // node test.js projects/ichifarm/index.js