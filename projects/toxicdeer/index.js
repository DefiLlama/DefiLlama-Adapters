const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

const XDSHARE = "0x6f715158d4b1468528da002f5941c72fe4159520";
const boardroom = "0x85b60750761d0e170237700Ce1e94213E1742A34";
const rewardPool = "0xf6c3e1B489c1e634a3c66876d5A8E19B1A65B252";
const lps = [
  "0x264f27bf0ec4fe383cfda50f1bb11588735bbe6d",
  "0x18cD20C6CA9Ccfe1C8b48516e6d5e0055a0271D2",
  "0x40d85d01f8b8E4A8cEa6F552e47Cf8F88A42db54"
];

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  return balances;
}
module.exports = {
  cronos: {
    tvl: tvl,
    pool2: pool2(rewardPool, lps),
    staking: staking(boardroom, XDSHARE)
  }
}; // node test.js projects/toxicdeer.js
