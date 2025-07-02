const { nullAddress } = require("../helper/treasury");
const {
  sumTokensExport,
  sumTokens,
} = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const treasury = "0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB";
const daiMKRLP = "0x517F9dD285e75b599234F7221227339478d0FcC8";
const MKR = ADDRESSES.ethereum.MKR;
const SKY = '0x56072c95faa701256059aa122697b133aded9279'
const DAI = ADDRESSES.ethereum.DAI

async function tvl(timestamp, block, chainBlocks, {api}) {
  const balances = {};
  const tokensAndOwners = [ 
    nullAddress,
    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ens
    '0x4da27a545c0c5B758a6BA100e3a049001de870f5',//staave
    '0xc00e94Cb662C3520282E6f5717214004A7f26888',//comp
    ADDRESSES.ethereum.AAVE,//aave
    '0x8f8221aFbB33998d8584A2B05749bA73c37a938a',//req
 ].map(t=>[t, treasury])
  await sumTokens(balances, tokensAndOwners, block);

  const all = await api.call({target: "0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b", abi: "function dai(address) view returns (uint256)", params: ["0xA950524441892A31ebddF91d3cEEFa04Bf454466"]})
  const vice = await api.call({target: "0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b", abi: "function vice() view returns (uint256)", })
  balances[DAI] = (all-vice)/1e27

  return balances;
}


module.exports = {
  ethereum: {
    tvl,
    ownTokens: sumTokensExport({
      tokens: [MKR,daiMKRLP,SKY],
      owners: [treasury],
    }),
  },
  arbitrum: {
    tvl:sumTokensExport({
      tokens: [nullAddress],
      owners: ["0x10e6593cdda8c58a1d0f14c5164b376352a55f2f"],
    }),
  },
}