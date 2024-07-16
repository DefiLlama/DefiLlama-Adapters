const WETH_CONTRACT = '0x4200000000000000000000000000000000000006';
const AUSDC_CONTRACT = '0x4e65fe4dba92790696d040ac24aa414708f5c0ab';
const SZDEBT_CONTRACT = '0xb0a00c4b3d77c896f46dc6b204695e22de7a185d';
const SIZE_PROXY_CONTRACT = '0xC2a429681CAd7C1ce36442fbf7A4a68B11eFF940';

async function tvl(api) {
  const tokens = [
    WETH_CONTRACT,
    AUSDC_CONTRACT,
  ]
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map(i => ({
      target: i,
      params: SIZE_PROXY_CONTRACT
    }))
  })
  return api.addTokens(tokens, balances)
}

async function borrowed(api) {
  const totalDebt = await api.call({
    abi: 'erc20:totalSupply',
    target: SZDEBT_CONTRACT,
    params: [],
  });

  return api.add(SZDEBT_CONTRACT, totalDebt)
}

module.exports = {
  base: {
    tvl,
    borrowed
  }
}