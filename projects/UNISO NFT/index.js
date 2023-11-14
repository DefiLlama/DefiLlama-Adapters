const ERC20_TOKEN_CONTRACT = '0x239579dacc83217dd6EFEB69567177100e932aB6';
const SOUL_NFT_CONTRACT = '0x0eB18e650E0363011eE94E4Be9952B5C53e2d90B';

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ERC20_TOKEN_CONTENT,
    params: [SOUL_NFT_CONTRACT],
  });

  api.add(ERC20_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of ERC20 tokens in the Club Bonding contract.',
  start: 1000235,
  bsc: {
    tvl,
  }
}; 
