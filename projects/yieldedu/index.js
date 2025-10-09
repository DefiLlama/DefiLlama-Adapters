
const { sumTokens2 } = require('../helper/unwrapLPs')

const YLD_CONTRACT = "0x145D410f1c831F185B5815fe4fD76308c76240f9";
const dEDU_CONTRACT = "0x597FFfA69e133Ee9b310bA13734782605C3549b7";
const WEDU_CONTRACT = "0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12"

async function tvl(api) {
  const balance = await api.call({
    target: dEDU_CONTRACT,
    abi: 'erc20:balanceOf',
    params: [YLD_CONTRACT],
    chain: 'occ',
  });

  api.add(WEDU_CONTRACT, BigInt(balance))
  return sumTokens2({ api, chain: 'occ' })
}

module.exports = {
  occ: {
    tvl,
  }
}
