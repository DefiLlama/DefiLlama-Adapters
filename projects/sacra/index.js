const { sumTokens2 } = require('../helper/unwrapLPs')
const wftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const tresury = "0x146dd6E8f9076dfEE7bE0b115bb165d62874d110";
const rewardPool = '0x8E629C4301871d2A07f76366FE421e86855DC690';

async function tvl(time, ethBlock, _b, { api}) {
  return sumTokens2({ tokens: [wftm], owners: [rewardPool, tresury], api })
}

module.exports = {
  methodology: `We count the WFTM on treasuty and reward pool`,
  fantom: {
    tvl: tvl
  }
}