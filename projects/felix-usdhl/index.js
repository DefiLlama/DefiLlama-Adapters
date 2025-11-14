async function tvl(api) {
  const mToken = '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b';
  const holder = '0xb50a96253abdf803d85efcdce07ad8becbc52bd5';  
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: mToken,
    params: [holder]
  })
  
  const usdValue = balance / 1e6;
  
  return { 'usd-coin': usdValue }
}

module.exports = {
  hyperliquid: {
    tvl,
  },
}