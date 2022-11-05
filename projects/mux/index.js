const { sumTokens2 } = require('../helper/unwrapLPs')

const sdk = require("@defillama/sdk");
const abi = [
  {
    inputs: [],
    name: "getAllAssetInfo",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "symbol",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "id",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
          },
          {
            internalType: "uint56",
            name: "flags",
            type: "uint56",
          },
          {
            internalType: "uint24",
            name: "_flagsPadding",
            type: "uint24",
          },
          {
            internalType: "uint32",
            name: "initialMarginRate",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "maintenanceMarginRate",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "minProfitRate",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "minProfitTime",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "positionFeeRate",
            type: "uint32",
          },
          {
            internalType: "address",
            name: "referenceOracle",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "referenceDeviation",
            type: "uint32",
          },
          {
            internalType: "uint8",
            name: "referenceOracleType",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "halfSpread",
            type: "uint32",
          },
          {
            internalType: "uint128",
            name: "_reserved1",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "_reserved2",
            type: "uint128",
          },
          {
            internalType: "uint96",
            name: "collectedFee",
            type: "uint96",
          },
          {
            internalType: "uint32",
            name: "_reserved3",
            type: "uint32",
          },
          {
            internalType: "uint96",
            name: "spotLiquidity",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "maxLongPositionSize",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "totalLongPosition",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "averageLongPrice",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "maxShortPositionSize",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "totalShortPosition",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "averageShortPrice",
            type: "uint96",
          },
          {
            internalType: "address",
            name: "muxTokenAddress",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "spotWeight",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "longFundingBaseRate8H",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "longFundingLimitRate8H",
            type: "uint32",
          },
          {
            internalType: "uint128",
            name: "longCumulativeFundingRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "shortCumulativeFunding",
            type: "uint128",
          },
        ],
        internalType: "struct Asset[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

const config = {
  arbitrum: '0x3e0199792Ce69DC29A0a36146bFa68bd7C8D6633',
  bsc: '0x855E99F768FaD76DD0d3EB7c446C0b759C96D520',
  avax: '0x0bA2e492e8427fAd51692EE8958eBf936bEE1d84',
  fantom: '0x2e81F443A11a943196c88afcB5A0D807721A88E6',
}

module.exports = {
  methodology: `This is the total value of all tokens in the MUXLP Pool. The liquidity pool consists of a token portfolio used for margin trading and third-party DEX mining.`,
}


Object.keys(config).forEach(chain => {
  const owner = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      const { output } = await sdk.api.abi.call({ target: owner, chain, block, abi: abi.find(i => i.name === 'getAllAssetInfo') })
      const tokens = output.map(i => i.tokenAddress)
      return sumTokens2({ chain, block, owner, tokens})
    }
  }
})
