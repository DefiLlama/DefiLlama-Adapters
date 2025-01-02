const ADDRESSES = require('../helper/coreAssets.json')
const { unknownTombs, sumUnknownTokens } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs')

const bond = "0x46D741b89102815710efeA3051291E64Ff49C228";
const share = "0x2dD2169dA1e5c6fE9A3F7AA4A50119B26316A86b";
const nodeAddress = "0x9C4430198D33Dde24094FDb354bd1AEEFC6cB68c";
const boardroom = "0x0bD6BD43c25F6f62476826c3FBcfD63821C148D8";
const rewardPool = "0x8e8D0bbb7a47291AFCF252f26679c3113Bc558dB";
const pool2lps = [
  "0xa698C6f3352e18519Ef53172d492ceF805D99aFA",
  "0x4216068dD62701E79F63287704eb6F1Fd2A29427",
];
const genesisPool = '0xb9F9993f0D4A63344D9571387E18f659B6AE5447'
const OORT = '0x3D1BBD0eC9Af25e8f12383d9F6a6bbFa6DfeF06F'
const WREI = ADDRESSES.rei.WREI
const OORT_LP = '0xB95783dCE72CF2C7fa13a6b3D7399A4223259878'
// module.exports = {
//     ...tombTvl(bond, share, rewardPool, boardroom, pool2lps, "rei", undefined, false, pool2lps[1])
// };


module.exports = unknownTombs({ shares: [share], rewardPool: [genesisPool, rewardPool], masonry: [boardroom, nodeAddress, ], chain: 'rei', 
useDefaultCoreAssets: true, lps: pool2lps })
module.exports.rei.tvl = async (_, _b, { rei: block }) => sumUnknownTokens({
  chain: 'rei',
  block,
  owners: [rewardPool, genesisPool],
  tokens: [WREI, OORT],
  lps: [OORT_LP],
  useDefaultCoreAssets: true,
})

staking(rewardPool, WREI)