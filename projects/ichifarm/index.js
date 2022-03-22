const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { stakings } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");

const ichi = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";
const xIchi = "0x70605a6457B0A8fBf1EEE896911895296eAB467E";
const tokenFactory = "0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a";
const farmContract = "0x275dFE03bc036257Cd0a713EE819Dbd4529739c8";
const ichiLending = "0xaFf95ac1b0A78Bd8E4f1a2933E373c66CC89C0Ce";
const angelVaults = [
  "0xfaeCcee632912c42a7c88c3544885A8D455408FA",
  "0x779F9BAd1f4B1Ef5198AD9361DBf3791F9e0D596",
  "0x3A4411a33CfeF8BC01f23ED7518208aA38cca824",
  "0x98bAd5Ce592DcfE706CC95a1B9dB7008B6D418F8",
  "0x2a8E09552782563f7A076ccec0Ff39473B91Cd8F"
]

const hodlVaults = [
  "0xd3FeD75d934Ab824Ff7FEcd0f8A70f204e61769b",
  "0xA380EA6BE1C084851aE7846a8F39def17eCf6ED8",
  "0x82FF3E2eC3bDCa84CF0637402907e26C51d1d676"
]

const oneTokens = [
  "0xbb9e5db6f357bb4df35e8b90b37b8a3f33031d86",
  "0x5047fc5c9d7c49ab22e390d13646a6a3a2476eff",
  "0xdb0f18081b505a7de20b18ac41856bcb4ba86a1a",
  "0xca37530e7c5968627be470081d1c993eb1deaf90",
  "0x78a3b2f1e7eec1073088ea4a193618743f81cef8"
]

const lendingPools = [
  { 
    target: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    params: ["0x5933f2109652c019ceab70dabf4bc9e0e29873f5"]
  },
  // { // oneUNI
  //   target: "0x8290D7a64F25e6b5002d98367E8367c1b532b534",
  //   params: ["0x342ac2c024f214a711356f48326614e1d8dd0420"]
  // },
  // { // xICHI
  //   target: "0x70605a6457B0A8fBf1EEE896911895296eAB467E",
  //   params: ["0xb7abc13db4aeaea90a17ae46291317ef8554f076"]
  // },
  { 
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xece2c0aa6291e3f1222b6f056596dfe0e81039b9"]
  },
  // { // ichiVault == oneUNI
  //   target: "0xfaeCcee632912c42a7c88c3544885A8D455408FA",
  //   params: ["0x78dcc36dc532b0def7b53a56a91610c44dd09444"]
  // }
]

async function getVaultTvl(balances, vaults, block) {

  const tokenCount = (await sdk.api.abi.call({
    target: tokenFactory,
    abi: abi["oneTokenCount"],
    block
  })).output;

  const tokenAtIndex = (await sdk.api.abi.multiCall({
    calls: Array.from({ length: Number(tokenCount) }, (_, k) => ({
      target: tokenFactory,
      params: k
    })),
    abi: abi["oneTokenAtIndex"],
    block
  })).output;

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

async function getTreasuryTvl(balances, tokenFactory, block) {
  const tokenCount = (await sdk.api.abi.call({
    target: tokenFactory,
    abi: abi["oneTokenCount"],
    block
  })).output;

  const tokenAtIndex = (await sdk.api.abi.multiCall({
    calls: Array.from({ length: Number(tokenCount) }, (_, k) => ({
      target: tokenFactory,
      params: k
    })),
    abi: abi["oneTokenAtIndex"],
    block
  })).output;

  for (let i = 0; i < tokenAtIndex.length; i++) {
    const asset = tokenAtIndex[i];
    const assetCount = (await sdk.api.abi.call({
      target: asset.output,
      abi: abi["assetCount"],
      block
    })).output;

    const assetAtIndex = (await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(assetCount) }, (_, k) => ({
        target: asset.output,
        params: k
      })),
      abi: abi["assetAtIndex"],
      block
    })).output;

    const assetBalances = (await sdk.api.abi.multiCall({
      calls: assetAtIndex.map(p => ({
        target: p.output,
        params: p.input.target
      })),
      abi: "erc20:balanceOf",
      block
    })).output;

    assetBalances.forEach(p => {
      const token = p.input.target.toLowerCase();
      const balance = p.output;

      if (token === "0xdb0f18081b505a7de20b18ac41856bcb4ba86a1a") {
        sdk.util.sumSingleBalance(balances, ["wing-finance"], BigNumber(balance).div(1e9).toFixed(0));
        return;
      }

      sdk.util.sumSingleBalance(balances, token, balance);
    })
  }
}

async function getDepositTvl(balances, tokenFactory, farmContract, block) {
  const tokenCount = (await sdk.api.abi.call({
    target: tokenFactory,
    abi: abi["oneTokenCount"],
    block
  })).output;

  const tokenAtIndex = (await sdk.api.abi.multiCall({
    calls: Array.from({ length: Number(tokenCount) }, (_, k) => ({
      target: tokenFactory,
      params: k
    })),
    abi: abi["oneTokenAtIndex"],
    block
  })).output;

  const tokenBalances = (await sdk.api.abi.multiCall({
    calls: tokenAtIndex.map(p => ({
      target: p.output,
      params: farmContract
    })),
    abi: "erc20:balanceOf",
    block
  })).output;

  tokenBalances.forEach(p => {
    if (unknownOneTokens.includes(p.input.target.toLowerCase())) {
      sdk.util.sumSingleBalance(balances, "0xdac17f958d2ee523a2206206994597c13d831ec7", BigNumber(p.output).div(1e12).toFixed(0));
    }
    else {
      sdk.util.sumSingleBalance(balances, p.input.target, p.output);
    }
  });
}

async function getLendingTvl(balances, block) {

  const ethBalance = (await sdk.api.eth.getBalance({
    target: "0xd2626105690e480dfeb12a64bc94b878df9d35d8",
    block: block,
  })).output;

  sdk.util.sumSingleBalance(
    balances, 
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 
    ethBalance
  )
  
  const balanceOfResults = await sdk.api.abi.multiCall({
    calls: lendingPools,
    abi: 'erc20:balanceOf',
    block
  })
  sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true)
}

async function tvl(timestamp, block) {
  let balances = {};

  await getTreasuryTvl(balances, tokenFactory, block);
  await getVaultTvl(balances, angelVaults, block);
  await getLendingTvl(balances, block);
  await getDepositTvl(balances, tokenFactory, farmContract, block);

  return balances;
}

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

module.exports = {
  methodology: "Tokens deposited to mint oneTokens, Angel and HODL vaults excluding oneTokens",
  misrepresentedTokens: true,
  startBlock: 11260000,
  ethereum: {
    tvl,
    pool2,
    staking: stakings([xIchi, ichiLending] , ichi)
  }
} // node test.js projects/ichifarm/index.js