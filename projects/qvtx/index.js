const PQUSD = '0x8d58dEbF89740Da1416d5f1904E4286096174B5A'

async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: PQUSD })
  api.add(PQUSD, supply)
}

module.exports = {
  methodology: 'TVL = pQUSD (fiat-backed USD stablecoin) total supply on Polygon. Each pQUSD is redeemable 1:1 for USD through the QVTX treasury (qvtx.net).',
  polygon: { tvl },
}
