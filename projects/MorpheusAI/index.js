const STETH_CONTRACT = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
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
