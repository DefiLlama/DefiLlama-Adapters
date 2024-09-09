
async function tvl(api) {
  const imBTC = '0x3212b29E33587A00FB1C83346f5dBFA69A458923'
  const supply = await api.call({  abi: 'erc20:totalSupply', target: imBTC })
  api.add(imBTC, supply)
}

module.exports = {
  ethereum: { tvl },
  methodology: `TVL for imBTC consists of the BTC deposits in custody that were used to mint imBTC`
}
