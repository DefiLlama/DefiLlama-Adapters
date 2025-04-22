const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const BigNumber = require("bignumber.js");

// --- All sushitokens lp tokens are staked here for LQDR tokens ---
const MASTERCHEF = "0x742474dae70fa2ab063ab786b1fbe5704e861a0c";
const MINICHEF = "0x6e2ad6527901c9664f016466b8DA1357a004db0f";
const BSCMINICHEF = "0xD46db083De31c64AF3F680f139A31fF37bac004f";
const usdcTokenAddress = ADDRESSES.fantom.USDC;
const wftmTokenAddress = ADDRESSES.fantom.WFTM;
const beethovenVaultAddress = "0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce";

const LQDR = "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9";
const xLQDR = "0x3Ae658656d1C526144db371FaEf2Fff7170654eE";

const shadowChefAddresses = [
  "0x59ab3c33e75C91B2B632d51144e57293EF64E556", // LQDR/FTM"
  "0xDC5bDd3966884a2b1cfFd4213DaE925778786f97", // SPIRIT/FTM
  "0xFfa8B88160Bd847a3bF032B78c8967DCa877981C", // USDC/FTM
  "0x767e4Dc3EA4FF70D97BDEEF086e4B021923E4BdD", // LINSPIRIT/SPIRIT
  "0xA7cB4E3Ea2d6B44F4109970d7E9E7B7aBa372Eb5", // WBTC/FTM"
  "0x9CD5ab5b2c00560E93Bb89174078a05b03Eb469e", // ETH/FTM"
  "0x477A71A9154050DFbC497B9F782CC5169f7BDDf5", // fUSDT/FTM"
  "0xc43a1555554FF87f957c0DD5B80ab54951265c2E", // DAI/FTM"
  "0xf4987eE98881ded997D1F3389B82ADF99e6592ed", // MIM/FTM"
  "0x3F576a5a3eb52e658bc88c23d8478Ac67eC90aeE", // FRAX/FTM"
  "0x3Ce75C35AF2DD29D76C7C8521c218c5A0f2826A8", // BIFI/FTM"
  "0x71943a80a81c64235fC45DE4BD06638556fC773E", // fUSDT/USDC"
  "0x3beFeA69e89931b70B80231389F97A9bF6827B2E", // DAI/USDC"
  "0x62A8bB540e52eDfFa5F71B9Ad6BEF52600A1e247", // MIM/USDC"
  "0xDcBd61032cF40C16f6d7B124676C89a0e2e874c4", // FRAX/USDC"
  "0xBb07eBA448e404B56Ba1273B762d690A57F7f84f", // MAI/USDC"
  "0x5bC0F62BfBAc6C5f977BaC73EdC8FbCED89Ba8EC", // BUSD/USDC"
  "0x4423Ca3dB49914c13068C484F9D341D636A515dd", // sFTMX/FTM"
  "0x22214b00318300e0D046feD2D9CB166cBb48Ba60", // alUSD/USDC"
  "0xA8E6F303092F0c345eEc9f780d72A8Bf56C54DF0", // gALCX/FTM"
  "0x04C4244F6b497343e2CcD6f3fE992910c8557dCE", // COMB/FTM"
  "0x46F8546E33900CcdB5D5FBE80af2449ecAe42128", // FXS/FTM"
  "0xD75d45215a5E8E484F1f094f15b2f626A953456e", // TAROT/FTM"
  "0x9757fd7d3B6281218E11Bab3b550eab8C4eF5eA9", // RING/FTM"
  "0xa0AC54644dfCE40F83F3B1BC941c234532B4B8e1", // CRE8R/FTM"
  "0x763caa35565d457AD4231E089C3E8fb3d0fa3d56", // WPGUNK/FTM
  "0xf2c00E3ee1c67aAD4169bD041aFd3B7ff98b2775", // wBOMB/FTM
  "0x57B57A9a34de8547EC4a26b4bded6e78c92C9A76", // USDC/BOO
  "0x948dbcf4595366297E5F2c1baD1593dBBDe875C6", // FTM/gALCX
  "0x1c9c9d2A73A07F2cbAaa7C086a2DA70f155667d6", // USDC/MAI
  "0x0f45B4A89AAb28f4C4dC2d08ebAD277983d4B67a", // LQDR/FTM
  "0x0BF91d2e547A07A41d48817bDD28cb331227d945", // MATIC/FTM
  "0x762C8112207820d60FbB9894D429A60c570Ab574", // TOR/FTM
  "0xD354908d297ce9a348b417d2e0F561EE7D11de5E", // wsHEC/FTM
];

const masterchefTvl = async (_ts, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = i => `fantom:${i}`;

  await addFundsInMasterChef(
    balances,
    MASTERCHEF,
    chainBlocks.fantom,
    "fantom",
    transformAddress,
    abi.poolInfo
  );

  return balances;
};

const hundredchefTvl = async (api) => {
  const balances = {};
  const transformAddress = i => `fantom:${i}`;

  const hdaiChefAddress = "0x79364E45648Db09eE9314E47b2fD31c199Eb03B9";
  const husdcChefAddress = "0x9A07fB107b9d8eA8B82ECF453Efb7cFb85A66Ce9";
  const hmimChefAddress = "0xeD566B089Fc80Df0e8D3E0AD3aD06116433Bf4a7";
  const hfraxChefAddress = "0x669F5f289A5833744E830AD6AB767Ea47A3d6409";

  const chefAddressess = [
    hdaiChefAddress,
    husdcChefAddress,
    hmimChefAddress,
    hfraxChefAddress,
  ];

  await Promise.all(chefAddressess.map( async chefAddress => {
    const token = await api.call({
      target: chefAddress,
      abi: abi.lpToken,
      params: 0
    })

    const exchangeRateStored = await api.call({
      target: token,
      abi: abi.exchangeRateStored,
    })

    const strategyAddress = await api.call({
      target: chefAddress,
      abi: abi.strategies,
      params: 0
    })

    const strategyBalanace = await api.call({
      target: strategyAddress,
      abi: abi.balanceOf,
    })

    sdk.util.sumSingleBalance(
      balances,
      transformAddress(usdcTokenAddress),
      new BigNumber(Number(strategyBalanace)).times(exchangeRateStored).div(chefAddress === husdcChefAddress ? 1e18 : 1e30).toFixed(0)
    );

  }))

  return balances;
};

async function getMinichefTvl(api, minichef, balances = {}) {
  const  [lpTokens, strategies] = await Promise.all([
    api.fetchList({  itemAbi: abi.lpToken, lengthAbi: abi.poolLength, target: minichef}),
    api.fetchList({  itemAbi: abi.strategies, lengthAbi: abi.poolLength, target: minichef}),
  ])

  const calls = []
  const callTokens = []
  strategies.forEach((val, i) => {
    if (val === ADDRESSES.null) return;
    calls.push(val)
    callTokens.push(lpTokens[i].toLowerCase())
  } )

  const balanceOfs = await api.multiCall({ abi: abi.balanceOf, calls })

  callTokens.forEach((token, i) => sdk.util.sumSingleBalance(balances,token,balanceOfs[i], api.chain))

  if (api.chain === 'fantom') {
    await Promise.all([
      resolveBPT(api, balances),
      resolvOperaBPT(api, balances),
    ])
  }

  return sumTokens2({ balances, api,
    // owner: minichef, tokens: lpTokens, 
    resolveLP: true, })
}

async function shadowChefTvl(api) {
  const balances = {}
  const  [lpTokens, strategies] = await Promise.all([
    api.multiCall({  abi: abi.shadowLpToken, calls: shadowChefAddresses}),
    api.multiCall({  abi: abi.shadowStrategy, calls: shadowChefAddresses}),
  ])

  const calls = []
  const callTokens = []
  strategies.forEach((val, i) => {
    if (val === ADDRESSES.null) return;
    calls.push(val)
    callTokens.push(lpTokens[i].toLowerCase())
  } )

  const balanceOfs = await api.multiCall({ abi: abi.balanceOf, calls })

  callTokens.forEach((token, i) => sdk.util.sumSingleBalance(balances,token,balanceOfs[i], api.chain))

  if (api.chain === 'fantom') {
    await Promise.all([
      resolveBPT(api, balances),
      resolvOperaBPT(api, balances),
    ])
  }

  return sumTokens2({ balances, api,
    // owner: minichef, tokens: lpTokens, 
    resolveLP: true, })
}

async function resolvOperaBPT(api, balances) {
  const key = 'fantom:0xcdf68a4d525ba2e90fe959c74330430a5a6b8226'
  const bal = balances[key]
  if (!bal) return;
  delete balances[key]

  const [tokenBalances, totalSupply] = await Promise.all([
    api.call({
      abi: abi.getPoolTokens,
      target: beethovenVaultAddress,
      params: ["0xcdf68a4d525ba2e90fe959c74330430a5a6b8226000200000000000000000008"],
    }),
    api.call({
      abi: abi.totalSupply,
      target: '0xcdf68a4d525ba2e90fe959c74330430a5a6b8226',
    }),
  ]);
  const lpTokenRatio = totalSupply === 0 ? 0 : bal / totalSupply
  const bptSftmxTvlInFtm = tokenBalances['1'][0]  * (100/30)* lpTokenRatio
  sdk.util.sumSingleBalance(balances,usdcTokenAddress,bptSftmxTvlInFtm, api.chain)
  return balances
}

async function resolveBPT(api, balances) {
  const key = 'fantom:0xc0064b291bd3d4ba0e44ccfc81bf8e7f7a579cd2'
  const bal = balances[key]
  if (!bal) return;
  delete balances[key]

  const [tokenBalances, totalSupply] = await Promise.all([
    api.call({
      abi: abi.getPoolTokens,
      target: beethovenVaultAddress,
      params: ["0xc0064b291bd3d4ba0e44ccfc81bf8e7f7a579cd200000000000000000000042c"],
    }),
    api.call({
      abi: abi.getVirtualSupply,
      target: '0xc0064b291bd3d4ba0e44ccfc81bf8e7f7a579cd2',
    }),
  ]);
  const sftmTokenAddress = "0xd7028092c830b5C8FcE061Af2E593413EbbC1fc1";
  const lpTokenRatio = totalSupply === 0 ? 0 : bal / totalSupply
  const bptSftmxTvlInFtm = tokenBalances['1'][1] * lpTokenRatio
  const bptSftmxTvlInFtm1 = tokenBalances['1'][2] * lpTokenRatio
  sdk.util.sumSingleBalance(balances,wftmTokenAddress,bptSftmxTvlInFtm, api.chain)
  sdk.util.sumSingleBalance(balances,sftmTokenAddress,bptSftmxTvlInFtm1, api.chain)
  return balances
}

module.exports = {
  fantom: {
    staking: staking(xLQDR, LQDR, "fantom", "fantom:" + LQDR),
    tvl: sdk.util.sumChainTvls([
      masterchefTvl,
      (api) => getMinichefTvl(api, MINICHEF),
      hundredchefTvl,
      shadowChefTvl,
    ]),
  },
  bsc: {
    tvl: (api) => getMinichefTvl(api, BSCMINICHEF),
  }
}; // node test.js projects/liquiddriver/index.js
