const ADDRESSES = require('./helper/coreAssets.json')
const { tombTvl } = require("./helper/tomb");
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('./helper/unwrapLPs');

const PES = "0x8efbaa6080412d7832025b03b9239d0be1e2aa3b";
const SPES = "0xBBd4650EeA85f9DBd83d6Fb2a6E8B3d8f32FE1C5";
const boardroom = "0x7614A4CEB3ACdfCd4841D7bD76c30e7a401E83cd";
const rewardPool = "0xdd403db142a320261858840103b907c2486240c6";
const lps = [
    "0x43713f13a350d104319126c13cd7402822a44f6b",
    "0xadab84bf91c130af81d76be9d7f28b8c4f515367",
];
const shareLps = "0x72c1f5fb7e5513a07e1ff663ad861554887a0a0a";
const genesisPool = "0x64bfCBe4480B53E8234Ca258a96720F29fe6A6fB";
const genesisTokens = [
    "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
    ADDRESSES.cronos.USDC,
    "0x97749c9b61f878a880dfe312d2594ae07aed7656",
    "0xb8df27c687c6af9afe845a2afad2d01e199f4878",
    "0x43713f13a350d104319126c13cd7402822a44f6b"
];

const exportObject = tombTvl(PES, SPES, rewardPool, boardroom, lps, "cronos", a => `cronos:${a}`, false, shareLps)

Object.keys(exportObject)
    .filter(chain => typeof exportObject[chain] === 'object')
    .forEach(chain => {
        const obj = exportObject[chain]
        Object.keys(obj).forEach(key => obj[key] = [obj[key]])  // now "{ bsc: { tvl } }"" becomes "{ bsc: {tvl: [ tvl ]}}"
    })

function addToExports(chain, key, fn) {
    if (!exportObject[chain]) exportObject[chain] = {}
    if (!exportObject[chain][key]) exportObject[chain][key] = []
    exportObject[chain][key].push(fn)
}

async function tvl(api) {
  return sumTokens2({ api, owner: genesisPool, tokens: genesisTokens, resolveLP: true })
}

addToExports('cronos', 'tvl', tvl)

Object.keys(exportObject)
  .filter(chain => typeof exportObject[chain] === 'object')
  .forEach(chain =>  {
    const obj = exportObject[chain]
    Object.keys(obj).forEach(key => {
      if (obj[key].length > 1)
        obj[key] = sdk.util.sumChainTvls(obj[key])
      else
        obj[key] = obj[key][0]
    })
  })

module.exports = {
    misrepresentedTokens: true,
    ...exportObject
}; // node test.js projects/pegasusdao.js