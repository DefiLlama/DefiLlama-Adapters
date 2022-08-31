const { sumUnknownTokens, getUniTVL } = require('../helper/unknownTokens');
const { stakingPricedLP, staking, } = require('../helper/staking')
const sdk = require('@defillama/sdk')
const blockng = require('../helper/abis/blockng.json');
const kashipairABI = require('../helper/abis/kashipair.json');
const BigNumber = require('bignumber.js');
const utils = require('../helper/utils');

const chain = 'smartbch'
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04"
const LAW = "0x0b00366fBF7037E9d75E4A569ab27dAB84759302"
const lawUSD = "0xE1E655BE6F50344e6dd708c27BD8D66492d6ecAf"

const coreAssets = [
  WBCH,
  LAW,
  '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72',  // FlexUSD
  '0xBc2F884680c95A02cea099dA2F524b366d9028Ba',  // BlockNG pegged USDT
]

const masterchefTvl = async (timestamp, ethBlock, { [chain]: block }) => {
  const toa = [
    ['0x0000000000000000000000000000000000000000', '0x896a8ddb5B870E431893EDa869feAA5C64f85978'], // BCH
    ['0x24d8d5Cbc14FA6A740c3375733f0287188F8dF3b', '0x82112e12533A101cf442ee57899249C719dc3D4c'], // DAIQUIRI
  ]

  return sumUnknownTokens({ chain, block, coreAssets, tokensAndOwners: toa, });
}

const pool2 = async (timestamp, ethBlock, { [chain]: block }) => {
  const toa = [
    ['0x88b2522b9f9121b3e19a28971a85d34d88e4acc6', '0xe49717403eEa8c9Fa03610Bd9E6df96Ac5066298'], // lawETP-LAW@BEN
    ['0x1d5a7bea34ee984d54af6ff355a1cb54c29eb546', '0xb7Ac725E59860051f77397C14dd8D30d9cb825e6'], // lawUsdfLawLpMist
    ['0x8e992c4c2c84e5d372ef9a933be06f34962e42f5', '0xf3F7dC16Cab45c946F04F3D2F965Ca6dCBDb3aae'], // lawUSD-flexUSD@BEN
    ['0xFEdfE67b179b2247053797d3b49d167a845a933e', '0x3D82b2D0927f528E708eC7680ae0088490A6d0C4'], // lawUSD-BCH@BEN
    ['0xd55a9a41666108d10d31baeeea5d6cdf3be6c5dd', '0xCee23c02B819e4B9b6E34753e3c0C7f21c4bC398'], // LAW-BCH@BEN
    // ['0x8735628e1E5442B49A37F9751B0793C11014d1b6', '0x5227fDc4876677551c487C42893e282a1E4A9dDa'], // lawETPlawswapLP
    // ['0x58B006A8380Cc4807b1d58C5a339A0E6f2338F1A', '0xc5E4c50f0d39E2A592419314D03880e541939d11'], // lawUsdfLawLpLawSwap
    // ['0x7d43E5A766E9325E981ede2396B1b51Ff8A635Ed', '0xa9172f21D5BD0d60A1f4d6aa73DFC3173512Af0E'], // lawUsdflexUsdLpLawSwap
    // ['0x43205613aD09aeF94fE0396F34c2C93eBc6D1b7E', '0xAfAca05002412b6200B2e24e3044E63713c9bcD3'], // lawUsdusdtLpLawSwap
    // ['0xB82FF56E3E91c102a5dAf9Aa31BaE4c8c63F53A5', '0x5a6b3a1B16794D492Fa9B72092C94468ae74901D'], // lawUSD-bcBCH@LAWSWAP
    // ['0x54AA3B2250A0e1f9852b4a489Fe1C20e7C71fd88', '0xE55dd317e8A4DaAB35dfEA7590518811947a4ADC'], // LAW-BCH@LAWSWAP
  ]

  return sumUnknownTokens({ chain, block, coreAssets, tokensAndOwners: toa, });
}


const BENTOBOX = "0xDFD09C4A1Fd999F6e8518398216c53fcEa6f4020"
const bentoAssets = [
  [LAW, "law"],
  [WBCH, "bitcoin-cash"]
]
const bentoTVLs = bentoAssets.map(asset => staking(BENTOBOX, asset[0], chain, asset[1], 18))

const lawswapFactory = '0x3A2643c00171b1EA6f6b6EaC77b1E0DdB02c3a62'.toLowerCase()
const lawETP = "0x4ee06d0486ced674E75Ed9e521725580e8ffDA21"
const LAW_LAWETP_PAIR = "0x8735628e1e5442b49a37f9751b0793c11014d1b6"
const lawETP_POOL = "0x7B2B28a986E744D646F43b9b7e9F6f416a2a2BdA" // lawETP single asset pool
const lawEtpPool = stakingPricedLP(lawETP_POOL, lawETP, "smartbch", LAW_LAWETP_PAIR, "law", 18)

// staking
const LAW_RIGHTS = "0xe24Ed1C92feab3Bb87cE7c97Df030f83E28d9667" // DAO address
const daoStaking = staking(LAW_RIGHTS, LAW, "smartbch", "law", 18)


const lawSwapTVL = getUniTVL({
  chain,
  factory: lawswapFactory,
  coreAssets,
})


//voter
const VOTER = "0x10EAc6Cf7F386A11B6811F140CA8B9D6Ae7FbDf5"
//blockng agg contract
const AGG = "0x2bb410bD6c71147A593aCbB1CEB586aA253EFD92"


const civilBeams = async (_, _b, { [chain]: block }) => {

  const beamCount = (await sdk.api.abi.call({
    target: AGG, abi: blockng["numberOfPool"], params: [VOTER], chain, block,
  })
  ).output
  //skip pool 0 cause it is nft pool
  const allbeamInfo = (await sdk.api.abi.call({
    abi: blockng["getPoolInfo"],
    target: AGG,
    params: [VOTER, LAW, 1, beamCount],
    chain, block,
  })
  ).output
  const gaugeMapping = {}
  for (let i = 0; i < allbeamInfo.length; i++) {
    let { dexFactory, gaugeAddress, lpTokenAddress, } = allbeamInfo[i]
    dexFactory = dexFactory.toLowerCase()
    gaugeAddress = gaugeAddress.toLowerCase()
    lpTokenAddress = lpTokenAddress.toLowerCase()
    if (dexFactory !== lawswapFactory)
      gaugeMapping[gaugeAddress] = lpTokenAddress
  }

  const toa = []
  Object.entries(gaugeMapping).forEach(([owner, token]) => toa.push([token, owner]))

  return sumUnknownTokens({ chain, block, coreAssets, tokensAndOwners: toa, });
}

// borrows
const kashiPairs = [
  ["0x3F562957b199d6362B378dBa5e3b45EE6fe77779", WBCH, lawUSD],
  ["0xd46e5a9Cd7A55Bf8d3582Ff66218aD3e63462506", LAW, lawUSD],
]

const bentoBorrows = async (_, _b, { [chain]: block }) => {
  const totalBorrow = kashipairABI.find(val => val.name === "totalBorrow");
  const totals = await Promise.all(kashiPairs.map(async (pair) => {
      const total = (await sdk.api.abi.call({
          target: pair[0],
          abi: totalBorrow,
          chain, block,
      })).output
      return total.base
  }))
  const total = totals.reduce((sum, val) => BigNumber(sum).plus(val).toFixed(0), "0")

  // skip conversion assuming 1 lawUSD = 1 flexUSD
  return {'tether': BigNumber(total).dividedBy(10 ** 18)}
}


// fetch punksTVL from an api endpoint, data is updated every 15 minutes
// Punk tvl is no longer counted, because we do not count nft value in any other protocol
const punksTVL = async () => {
  const response = await utils.fetchURL(`https://raw.githubusercontent.com/BlockNG-Foundation/LawPunkMetaverse/master/punksTVL.json`)
  const tvl = Number(response.data.totalPunkValueLockedInBch) / 1e18
  return { "bitcoin-cash": tvl }
}


module.exports = {
  smartbch: {
    tvl: sdk.util.sumChainTvls([lawSwapTVL, masterchefTvl, ...bentoTVLs,  ]),
    // borrowed: bentoBorrows,
    pool2: sdk.util.sumChainTvls([pool2, civilBeams, ]),
    staking: sdk.util.sumChainTvls([lawEtpPool, daoStaking,]),
  }
}