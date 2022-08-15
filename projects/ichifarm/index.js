const sdk = require("@defillama/sdk");
const ethers = require("ethers");
const { stakings } = require("../helper/staking");
const abi = require("./abi.json");
const chain = 'ethereum'
const { createIncrementArray } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')


const ichi = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";
const ichiNew = "0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6";
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

const lendingPools = [
  {
    target: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    params: ["0x5933f2109652c019ceab70dabf4bc9e0e29873f5"]
  },
  { // oneUNI
    target: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    params: ["0x8290D7a64F25e6b5002d98367E8367c1b532b534"]
  },
  { // oneUNI
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x8290D7a64F25e6b5002d98367E8367c1b532b534"]
  },
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
  { // oneFOX
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x03352D267951E96c6F7235037C5DFD2AB1466232"]
  },
  { // oneFOX
    target: "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d",
    params: ["0x03352D267951E96c6F7235037C5DFD2AB1466232"]
  },
  { // oneBTC
    target: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    params: ["0xEc4325F0518584F0774b483c215F65474EAbD27F"]
  },
  {  // oneBTC
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xEc4325F0518584F0774b483c215F65474EAbD27F"]
  },
  { // oneFUSE
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xBbcE03B2E7f53caDCA93251CA4c928aF01Db6404"]
  },
  { // oneFUSE
    target: "0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d",
    params: ["0xBbcE03B2E7f53caDCA93251CA4c928aF01Db6404"]
  },
  { // onePERL
    target: "0xeca82185adCE47f39c684352B0439f030f860318",
    params: ["0xD9A24485e71B9148e0Fd51F0162072099DF0dB67"]
  },
  {  // onePERL
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xD9A24485e71B9148e0Fd51F0162072099DF0dB67"]
  },

  { // oneFIL
    target: "0xD5147bc8e386d91Cc5DBE72099DAC6C9b99276F5",
    params: ["0x6d82017e55b1D24C53c7B33BbB770A86f2ca229D"]
  },
  {  // oneFIL
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x6d82017e55b1D24C53c7B33BbB770A86f2ca229D"]
  },
  { // one1INCH
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x853Bb55c1f469902F088A629db8C8803A9BE3857"]
  },
  { // one1INCH
    target: "0x111111111117dC0aa78b770fA6A738034120C302",
    params: ["0x853Bb55c1f469902F088A629db8C8803A9BE3857"]
  },
  { // oneMPH
    target: "0x8888801aF4d980682e47f1A9036e589479e835C5",
    params: ["0xBE3F88E18BE3944FdDa830695228ADBB82fA125F"]
  },
  {  // oneMPH
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xBE3F88E18BE3944FdDa830695228ADBB82fA125F"]
  },
]


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

async function getVaults(block) {
  const topic = 'ICHIVaultCreated(address,address,address,bool,address,bool,uint24,uint256)'
  const logs = (
    await sdk.api.util.getLogs({
      keys: [],
      toBlock: block,
      target: '0x5a40DFaF8C1115196A1CDF529F97122030F26112',
      fromBlock: 13673136,
      topic,
    })
  ).output
  let iface = new ethers.utils.Interface(['event ICHIVaultCreated(address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'])
  // const pools = logs
  // .map((log) => `0x${log.topics[2].substring(26)}`)
  return logs.map((log) => iface.parseLog(log).args);
}

const oneFactory = '0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a'
async function tvl(timestamp, block) {
  const { output: oneTokenCount } = await sdk.api.abi.call({
    target: oneFactory,
    abi: abi.oneTokenCount,
    chain, block,
  })

  const params = createIncrementArray(oneTokenCount).map(i => ({ params: i }))
  const { output: oneTokens } = await sdk.api.abi.multiCall({
    target: oneFactory,
    abi: abi.oneTokenAtIndex,
    calls: params,
    chain, block,
  })

  const { output: collateralCounts } = await sdk.api.abi.multiCall({
    abi: abi.assetCount,
    calls: oneTokens.map(i => ({ target: i.output })),
    chain, block,
  })
  const collateralCalls = []
  collateralCounts.forEach(i =>
    createIncrementArray(i.output).forEach(j => collateralCalls.push({ target: i.input.target, params: j }))
  )

  const { output: collateralTokenAtIndex } = await sdk.api.abi.multiCall({
    abi: abi.assetAtIndex,
    calls: collateralCalls,
    chain, block,
  })

  const toa = []
  collateralTokenAtIndex.forEach(i => toa.push([i.output, i.input.target]))

  const vaults = await getVaults(block)
  const poolsCalls = vaults.map(i => ({ target: i.ichiVault }))
  const { output: pools } = await sdk.api.abi.multiCall({
    abi: abi.pool,
    calls: poolsCalls,
    chain, block,
  })
  pools.forEach((data, i) => {
    const vault = vaults[i].ichiVault
    const pool = data.output
    toa.push([vaults[i].tokenA, vault])
    toa.push([vaults[i].tokenB, vault])
    toa.push([vaults[i].tokenA, pool])
    toa.push([vaults[i].tokenB, pool])
  })
  const ichiTokens = oneTokens.map(i => i.output)
  const blacklistedTokens = [...ichiTokens, ichi, ichiNew,]
  const balances = await sumTokens2({ tokensAndOwners: toa, block, chain, blacklistedTokens })
  await getLendingTvl(balances, block);
  return balances
}

async function polygonTvl(_, _b, { polygon: block }){
  const chain = 'polygon'
  const tokensAndOwners = [
    // oneBTC mint
    ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174', '0x1f194578e7510A350fb517a9ce63C40Fa1899427'],
    ['0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', '0x1f194578e7510A350fb517a9ce63C40Fa1899427'],
  ]

  return sumTokens2({ chain, block, tokensAndOwners, })
}

module.exports = {
  methodology: "Tokens deposited to mint oneTokens, Angel and HODL vaults excluding oneTokens",
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    pool2: async (_, block) => {
      const toa = [
        ['0x9cd028b1287803250b1e226f0180eb725428d069', farmContract],
        ['0xd07d430db20d2d7e0c4c11759256adbcc355b20c', farmContract],
      ]
      poolWithTokens.forEach(([o, tokens]) => tokens.forEach(t => toa.push([t, o])))
      return sumTokens2({ tokensAndOwners: toa, block, resolveLP: true, })
    },
    staking: stakings([xIchi, ichiLending] , ichi)
  },
  polygon: {
    tvl: polygonTvl,
  }
} // node test.js projects/ichifarm/index.js