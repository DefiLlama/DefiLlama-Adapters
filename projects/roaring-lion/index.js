const sdk = require("@defillama/sdk");
const { unwrapBalancerToken } = require('../helper/unwrapLPs')

const LION = "0x3CC9E655B6c4f530DFc1b1fC51CeEa65c6344716";
const LSHARE = "0x50d8D7F7CcEA28cc1C9dDb996689294dC62569cA";
const boardroom = "0x4Dcf5DE955bB5Ae615684582A177974D8155D9fc";
const rewardPool = "0x119ad97096fff8629347f5af7f36ac1a32de4f2d";


//users can only lock lps in the boardroom
async function pool2(timestamp, block, chainBlocks, { api }) {
  return unwrapBalancerToken({ api, balancerToken: "0x950667EF678bAe44Ef037c721E564C365FC8303E",    owner: boardroom, }) 
}

module.exports = {
  methodology: 'TVL consists of 30DAI-70LSHARE balancer pools that users can lock in the boardroom',
  bsc: {
    tvl: () => ({}),
    pool2: pool2,
    //staking: LshareRewardPool has no tokens locked
  }
}; // node test.js projects/roaring-lion/index.js