const ROSY_TOKEN_CONTRACT = '0x6665a6Cae3F52959f0f653E3D04270D54e6f13d8';
const STEAK_CONTRACT = '0x3e7ab819878bEcaC57Bd655Ab547C8e128e5b208';

async function tvl(_, _1, _2, { api }) {
  const stakedBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ROSY_TOKEN_CONTRACT,
    params: [STEAK_CONTRACT],
  });

  api.add(ROSY_TOKEN_CONTRACT, stakedBalance)
}

module.exports = {
  misrepresentedTokens: false,
  methodology: 'counts the number of ROSY tokens in the Steak contract.',
  start: 1711020000,
  sapphire: {
    tvl,
  }
}; 