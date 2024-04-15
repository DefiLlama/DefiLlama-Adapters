const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens")
const chain = 'fantom'

const acropolisAddress = "0xe5009dd5912a68b0d7c6f874cd0b4492c9f0e5cd";
const treasuryAddress = "0xa0e0f462d66de459711bc721ce1fdcc3d9405831";

// Token Addresses
const basedTokenAddress = "0x8d7d3409881b51466b483b11ea1b8a03cded89ae";
const bshareTokenAddress = "0x49c290ff692149a4e16611c694fded42c954ab7a";
const usdcAddress = ADDRESSES.fantom.USDC;
const usdtAddress = ADDRESSES.fantom.fUSDT;
const maiAddress = "0xfB98B335551a418cD0737375a2ea0ded62Ea213b";
const wftmAddress = ADDRESSES.fantom.WFTM;

const treasuryTokens = [
  usdcAddress,
  usdtAddress,
  maiAddress,
  wftmAddress,
];

async function treasury(api) {
  return sumTokens2({ owner: treasuryAddress, tokens: treasuryTokens, api })
}

module.exports = {
  methodology: "Pool2 deposits consist of BASED/FTM LP, BSHARE/FTM LP, BBOND single stake pool while the staking TVL consists of the BSHARES tokens locked within the Acropolis contract. Treasury consists of accumulated revenue from native and non-native assets",
  fantom: {
    tvl: getUniTVL({
             factory: '0x407C47E3FDB7952Ee53aa232B5f28566A024A759',
             useDefaultCoreAssets: true,
           }),
    staking: staking(acropolisAddress, bshareTokenAddress),
    treasury
  },
};

module.exports.hallmarks = [
  [Math.floor(new Date('2022-09-30')/1e3), 'Added Based V2'],
]