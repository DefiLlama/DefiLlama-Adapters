const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens, getUniTVL, sumTokensExport } = require('../helper/unknownTokens');
const { staking, } = require('../helper/staking')
const sdk = require('@defillama/sdk')
const blockng = {
  "getPoolInfo": "function getPoolInfo(address, address, uint256, uint256) view returns (tuple(address lpTokenAddress, address subTokenAddress, string subTokenSymbol, address dexFactory, address gaugeAddress, uint256 gaugeTotalSupply, uint256 lpPrice, uint256 gaugeAPR, address bribeAddress, int256 weights, uint256 punkId)[] beams)",
  "numberOfPool": "function numberOfPool(address voter) view returns (uint256 len)"
}

const chain = 'smartbch'
const WBCH = ADDRESSES.smartbch.WBCH
const LAW = ADDRESSES.smartbch.LAW

const coreAssets = [
  WBCH,
  LAW,
  ADDRESSES.smartbch.flexUSD,  // FlexUSD
  ADDRESSES.smartbch.bcUSDT,  // BlockNG pegged USDT
]

const masterchefTvl = async (timestamp, ethBlock, { [chain]: block }) => {
  const toa = [
    [ADDRESSES.null, '0x896a8ddb5B870E431893EDa869feAA5C64f85978'], // BCH
    [ADDRESSES.smartbch.DAIQUIRI, '0x82112e12533A101cf442ee57899249C719dc3D4c'], // DAIQUIRI
  ]

  return sumUnknownTokens({ chain, block, useDefaultCoreAssets: true, tokensAndOwners: toa, });
}

const pool2 = async (timestamp, ethBlock, { [chain]: block }) => {
  const toa = [
    ['0x88b2522b9f9121b3e19a28971a85d34d88e4acc6', '0xe49717403eEa8c9Fa03610Bd9E6df96Ac5066298'], // lawETP-LAW@BEN
    ['0x1d5a7bea34ee984d54af6ff355a1cb54c29eb546', '0xb7Ac725E59860051f77397C14dd8D30d9cb825e6'], // lawUsdfLawLpMist
    ['0x8e992c4c2c84e5d372ef9a933be06f34962e42f5', '0xf3F7dC16Cab45c946F04F3D2F965Ca6dCBDb3aae'], // lawUSD-flexUSD@BEN
    ['0xFEdfE67b179b2247053797d3b49d167a845a933e', '0x3D82b2D0927f528E708eC7680ae0088490A6d0C4'], // lawUSD-BCH@BEN
    ['0xd55a9a41666108d10d31baeeea5d6cdf3be6c5dd', '0xCee23c02B819e4B9b6E34753e3c0C7f21c4bC398'], // LAW-BCH@BEN
  ]

  return sumUnknownTokens({ chain, block, useDefaultCoreAssets: true, tokensAndOwners: toa, });
}


const BENTOBOX = "0xDFD09C4A1Fd999F6e8518398216c53fcEa6f4020"
const bentoAssets = [
  [LAW, "law"],
  [WBCH, "bitcoin-cash"]
]
const bentoTVLs = bentoAssets.map(asset => staking(BENTOBOX, asset[0], chain,))

const lawswapFactory = '0x3A2643c00171b1EA6f6b6EaC77b1E0DdB02c3a62'.toLowerCase()
const lawETP = "0x4ee06d0486ced674E75Ed9e521725580e8ffDA21"
const LAW_LAWETP_PAIR = "0x8735628e1e5442b49a37f9751b0793c11014d1b6"
const lawETP_POOL = "0x7B2B28a986E744D646F43b9b7e9F6f416a2a2BdA" // lawETP single asset pool

// staking
const LAW_RIGHTS = "0xe24Ed1C92feab3Bb87cE7c97Df030f83E28d9667" // DAO address


const lawSwapTVL = getUniTVL({
  factory: lawswapFactory,
  useDefaultCoreAssets: true,
})


//voter
const VOTER = "0x10EAc6Cf7F386A11B6811F140CA8B9D6Ae7FbDf5"
//blockng agg contract
const AGG = "0x2bb410bD6c71147A593aCbB1CEB586aA253EFD92"


const civilBeams = async (api) => {

  const beamCount = await api.call({ target: AGG, abi: blockng["numberOfPool"], params: [VOTER], })
  //skip pool 0 cause it is nft pool
  const allbeamInfo = await api.call({
    abi: blockng["getPoolInfo"],
    target: AGG,
    params: [VOTER, LAW, 1, beamCount],
  })
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

  return sumUnknownTokens({ api, coreAssets, tokensAndOwners: toa, });
}

module.exports = {
  smartbch: {
    tvl: sdk.util.sumChainTvls([lawSwapTVL, masterchefTvl, ...bentoTVLs,]),
    // borrowed: bentoBorrows,
    pool2: sdk.util.sumChainTvls([pool2, civilBeams,]),
    staking: sumTokensExport({
      chain, tokensAndOwners: [
        [lawETP, lawETP_POOL,],
        [LAW, LAW_RIGHTS],
      ], useDefaultCoreAssets: true, lps: [LAW_LAWETP_PAIR],
    }),
  }
}