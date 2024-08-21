const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens2 } = require('../helper/unwrapLPs')
const { tombTvl } = require('../helper/tomb')

const SHIFT = "0x4f9bd6be8455ee2b3c7ff76bbb885e6654797137";
const SFSHARE = "0xE64fF204Df5f3D03447dA4895C6DA1fB590F1290";
const boardroom = "0x251672021bE4Cbf8eD5a6Acb66478a29c95c7Cb5";
const rewardPool = "0x585ab630996dB20F7aCc0dbC48e7c332620E7D59";
const USDC = ADDRESSES.cronos.USDC
const factory = "0x9fB58aBA4a3aD49d273b42cb8F495C58e9a8d14F"
const lps = [
  "0xCbEA9C785D0D6233d3F965baC901ea42A7a3B05c",
  "0x69D31656669d798112D910A81ED39A9914Eabb8A",
];
const chain = 'cronos'
module.exports = tombTvl(SHIFT, SFSHARE, rewardPool, boardroom, lps, chain, undefined, false, lps[0])

module.exports[chain].tvl = async  (api) => {
  return sumTokens2({ api, owner: factory, tokens: [USDC ]})
}
