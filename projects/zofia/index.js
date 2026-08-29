// projects/zofia/index.js

const ZOFIA_TOKEN = '0x2e6576c64b27aed687556a4ef39b1547534429ad';
const POOL_CONTRACT = '0x23190194f76A7c93a4e64a9DFb38C2c45721d587'; // QuickSwap ZOFIA/USDC pool

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: ZOFIA_TOKEN,
    params: [POOL_CONTRACT],
  });
  api.add(ZOFIA_TOKEN, balance);
}

module.exports = {
  methodology: 'TVL is calculated as the total ZOFIA tokens locked in the QuickSwap ZOFIA/USDC liquidity pool.',
  start: 0,
  polygon: {
    tvl,
  },
};
