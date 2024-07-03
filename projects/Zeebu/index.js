const ZEEBU_TOKEN_CONTRACT = '0x4D3dc895a9EDb234DfA3e303A196c009dC918f84';
const ZEEBU_USER_ADDRESS = '0xC2855eAc217a5E989FCeEDE93e453bd555FE720e';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ZEEBU_TOKEN_CONTRACT,
    params: [ZEEBU_USER_ADDRESS],
  });

  api.add(MINT_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  methodology: 'counts the number of ZEEBU tokens top user.',
  start: 1000235,
  bsc: {
    tvl,
  }
}; 
