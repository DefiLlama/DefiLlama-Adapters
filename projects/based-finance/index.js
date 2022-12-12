const sdk = require("@defillama/sdk");
const { mergeExports } = require('../helper/utils')
const { sumTokens2, } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const basedV2Exports = require('./basedV2')
const { getUniTVL } = require("../helper/unknownTokens")
const { getALLTVL } = require("../helper/yieldHelper")
const chain = 'fantom'

const usdcRewardPoolAddress = "0x3A554736b2aF99F5574Ee630Db5Ae33Af118235e";
const acropolisAddress = "0xe5009dd5912a68b0d7c6f874cd0b4492c9f0e5cd";
const treasuryAddress = "0xa0e0f462d66de459711bc721ce1fdcc3d9405831";

// Token Addresses
const basedTokenAddress = "0x8d7d3409881b51466b483b11ea1b8a03cded89ae";
const bshareTokenAddress = "0x49c290ff692149a4e16611c694fded42c954ab7a";
const bbondAddress = "0xC078285F16665B3F4bCe74AbDCF0f4C877de3E9f";
const usdcAddress = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
const usdtAddress = "0x049d68029688eAbF473097a2fC38ef61633A3C7A";
const maiAddress = "0xfB98B335551a418cD0737375a2ea0ded62Ea213b";
const wftmAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
const tshareAddress = "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37";

// LP Addresses
const basedFtmLpAddress = "0x0981916Bd96d375dAd0067Fd24E19120D2fcF5e6";
const bshareFtmLpAddress = "0x52A5B9E36F53b54Ed9ddd7a4e66Ac26696E9F0be";
const ftmUsdcLpAddress = "0x7a6C9B27e20560253d4080944A252494C702f1a2";

const poolLPs = [
  basedFtmLpAddress,
  bshareFtmLpAddress,
  bbondAddress
];

const treasuryTokens = [
  usdcAddress,
  usdtAddress,
  maiAddress,
  wftmAddress,
  basedTokenAddress,
  bshareTokenAddress,
  bbondAddress,
  basedFtmLpAddress,
  bshareFtmLpAddress,
  ftmUsdcLpAddress
];

async function pool2(_, _b, {fantom: block }) {
  return sumTokens2({ owner: usdcRewardPoolAddress, tokens: poolLPs, block, chain, })
}

async function treasury(_, _b, { fantom: block }) {
  return sumTokens2({ owner: treasuryAddress, tokens: treasuryTokens, block, chain, })
}

module.exports = {
  methodology: "Pool2 deposits consist of BASED/FTM LP, BSHARE/FTM LP, BBOND single stake pool while the staking TVL consists of the BSHARES tokens locked within the Acropolis contract. Treasury consists of accumulated revenue from native and non-native assets",
  fantom: {
    tvl: getUniTVL({
             factory: '0x407C47E3FDB7952Ee53aa232B5f28566A024A759',
             chain: 'fantom',
             useDefaultCoreAssets: true,
           }),
    pool2,
    staking: staking(acropolisAddress, bshareTokenAddress, "fantom"),
    treasury
  },
};

// module.exports = {
//   methodology: "Counts the tokens locked on AMM pools using the factory contract(0xE236f6890F1824fa0a7ffc39b1597A5A6077Cfe9) to find all of the pairs",
//   fantom: {
//     tvl: getUniTVL({
//       factory: '0x407C47E3FDB7952Ee53aa232B5f28566A024A759',
//       chain: 'fantom',
//       useDefaultCoreAssets: true,
//     })
//   },
// };

module.exports.hallmarks = [
  [Math.floor(new Date('2022-09-30')/1e3), 'Added Based V2'],
]