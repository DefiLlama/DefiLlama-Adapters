const USDC_TOKEN_CONTRACT = '0x176211869cA2b568f2A7D4EE941E073a821EE1ff';
const ETH_TOKEN_CONTRACT = '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f';

const ETHUSDC_PAIR_CONTRACT = '0xCeC911f803D984ae2e5A134b2D15218466993869';


async function tvl(_, _1, _2, { api }) {
  const usdcBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_TOKEN_CONTRACT,
    params: [ETHUSDC_PAIR_CONTRACT],
  });

  const ethBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ETH_TOKEN_CONTRACT,
    params: [ETHUSDC_PAIR_CONTRACT],
  });

  api.add(USDC_TOKEN_CONTRACT, usdcBalance)
  api.add(ETH_TOKEN_CONTRACT, ethBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  start: 1000235,
  linea: {
    tvl,
  }
}; 