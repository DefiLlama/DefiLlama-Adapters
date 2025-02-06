const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const contracts = {
  BUSD: ADDRESSES.bsc.BUSD,
  TRUNK: '0xdd325C38b12903B727D16961e61333f4871A70E0',
  treasury: '0xCb5a02BB3a38e92E591d323d6824586608cE8cE4',
  LP_TRUNK: '0xf15A72B15fC4CAeD6FaDB1ba7347f6CCD1E0Aede',
  LP_ELEPHANT_BNB: '0x1cea83ec5e48d9157fcae27a19807bef79195ce1',
  LP_ELEPHANT_BUSD: '0x647bc907d520c3f63be38d01dbd979f5606bec48',
  staking: '0xAF0980A0f52954777C491166E7F40DB2B6fBb4Fc',
  ELEPHANT: '0xE283D0e3B8c102BAdF5E8166B73E02D96d92F688'
};

const LPs = [contracts.LP_TRUNK, contracts.LP_ELEPHANT_BNB, contracts.LP_ELEPHANT_BUSD]

async function tvl(timestamp, block, chainBlocks) {
  return { [`bsc:${contracts.BUSD}`] : (await sdk.api.erc20.balanceOf({
    target: contracts.BUSD,
    owner: contracts.treasury,
    block: chainBlocks.bsc,
    chain: 'bsc'
  })).output };
}

module.exports = {
  bsc: {
    pool2: pool2([contracts.TRUNK, contracts.ELEPHANT], LPs),
    tvl: tvl,
    staking: stakings([contracts.staking], contracts.ELEPHANT)
  }
};