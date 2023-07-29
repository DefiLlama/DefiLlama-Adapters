
const WKAVA = '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b';
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