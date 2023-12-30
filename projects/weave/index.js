const ADDRESSES = require('../helper/coreAssets.json')

const WKAVA = ADDRESSES.kava.WKAVA;
const STRATEGY_CONTRACT = '0x9633a42E4f73F465DD421b22C09E2787493DaAdA'

async function tvl(_, _1, _2, { api }) {
  const strategyBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WKAVA,
    params: [STRATEGY_CONTRACT],
  });

  api.add(WKAVA, strategyBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'gets the balance of the strategy contract',
  start: 5793963,
  kava: {
    tvl,
  }
}; 