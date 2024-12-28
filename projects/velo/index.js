const { getUniTVL } = require('../helper/unknownTokens')

const AprFixLockedAddresses = [
  "0x5e10B2247a430f97c94205894B9185F687A32345",
  "0x13c5C83cf9B9aC68FA18272B756Bce1635196132",
  "0x022af5ce19720a938Ba8C9E66FdF1Da1606298eF",
  "0x37cCcC19acAB91E8bC6074Cb4EaaFef1185ee1Bb",
  "0x051bB49EdB865Bb4cC9277BbB132C922403B07e4",
  "0x2703E5D3709782e85957E40a9c834AFD4D45caF9",
  "0x5935DC3250a0d8a0aC7c2e4AB925C4FEf2F8FDf8",
  "0x59098E3c6C5Bcbecb4117C6eF59b341d1F0F3083",
  "0xDa000FA80C5E9cb4E24a66bFF6a56cC454422e78",
  "0xEfA6EAbcb5fa35827DDB236046B3DDB6d257022B",
  "0xc12A93bf62CfD50620BCfDDD903913903DF647B4",
  "0xc322a2110958c1365e88D88aef65Ebdf335b6E67",
  "0x7dd617eacd7Fd35f69275f943Ff82218213796b7"
];

const AprFixLockWithChangeableRatioTvl = [
  "0xEF03B465A6D7baDF8727819104d29F0405d1Ce65"
]

const OldFarmContractAddress = "0x33472144Eaa7540E7badA5a1ab7Da372e48a9252"
const CurrentFarmContractAddress = "0xDD3e2da1d017A564b8225bc8e92f2970cfa61945"

const VELO = '0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46'

async function staking(api) {
  const totalStaked = await api.multiCall({ abi: 'uint256:totalStaked', calls: AprFixLockedAddresses.concat(AprFixLockWithChangeableRatioTvl) })
  api.add(VELO, totalStaked)
  const tokens = [
    "0x3c8EC1728C080f76dc83baA5d51A0cC367B4A35F",  // VELO_DEPRECATED_TOKEN
    "0xf486ad071f3bee968384d2e39e2d8af0fcf6fd46",  // VELO_TOKEN
    "0xC2d4A3709e076A7A3487816362994a78ddaeabB6", // EVRY_TOKEN
  ]
  return api.sumTokens({ owners: [OldFarmContractAddress, CurrentFarmContractAddress], tokens })
}

module.exports = {
  methodology: 'Sums the total value locked of all farms and locked pools in Velo Finance.',
  bsc: {
    tvl: getUniTVL({ factory: '0xa328180188a30feF1d82c9FC916E627DB6E17238', blacklistedTokens: [VELO] }),
    staking,
  },
};
