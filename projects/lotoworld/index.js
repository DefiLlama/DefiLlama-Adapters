const USDT_TOKEN = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const LOTOWORLD_CONTRACT = '0xdefcC8E8dB82D1D722045f704f8af29F94207439';

async function tvl(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDT_TOKEN,
    params: [LOTOWORLD_CONTRACT],
  });
  api.add(USDT_TOKEN, balance);
}

module.exports = {
  methodology:
    'TVL is the USDT balance held in the Lotoworld lottery contract, representing the current prize pool awaiting the next draw.',
  start: 503115768,
  arbitrum: {
    tvl,
  },
};
