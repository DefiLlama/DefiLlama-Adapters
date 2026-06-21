const ADDRESSES = require('./helper/coreAssets.json')
const { tombTvl } = require("./helper/tomb");
const { sumTokensExport } = require('./helper/unwrapLPs');

const SPES = "0xBBd4650EeA85f9DBd83d6Fb2a6E8B3d8f32FE1C5";
const boardroom = "0x7614A4CEB3ACdfCd4841D7bD76c30e7a401E83cd";
const rewardPool = "0xdd403db142a320261858840103b907c2486240c6";
const lps = [
    "0x43713f13a350d104319126c13cd7402822a44f6b",
    "0xadab84bf91c130af81d76be9d7f28b8c4f515367",
];
const genesisPool = "0x64bfCBe4480B53E8234Ca258a96720F29fe6A6fB";
const genesisTokens = [
    ADDRESSES.cronos.WCRO_1,
    ADDRESSES.cronos.USDC,
    "0x97749c9b61f878a880dfe312d2594ae07aed7656",
    "0xb8df27c687c6af9afe845a2afad2d01e199f4878",
    "0x43713f13a350d104319126c13cd7402822a44f6b"
];
module.exports = {
  cronos: {
    tvl: sumTokensExport({ owner: genesisPool, tokens: genesisTokens, }),
    staking: sumTokensExport({ owner: boardroom, tokens: [SPES], }),
    pool2: sumTokensExport({ owners: [boardroom, rewardPool], tokens: lps, resolveLP: true }), 
  }
}