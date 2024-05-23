const ADDRESSES = require('../helper/coreAssets.json')
const STETH_CONTRACT = ADDRESSES.ethereum.STETH;
const PROJECT_CONTRACT = '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790';

async function tvl(_, __, ___, { api }) {
  const stEthBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: STETH_CONTRACT,
    params: [PROJECT_CONTRACT],
  });

  api.add(STETH_CONTRACT, stEthBalance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Calculates TVL based on stETH deposits in the project contract.',
  ethereum: {
    tvl,
  },
};
