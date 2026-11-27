const PQUSD = '0x8d58dEbF89740Da1416d5f1904E4286096174B5A'
const WQVTX = '0xb171FD866D9B874Ee9260fb106743CF3765B9Ec1'
const POOL  = '0xEf12Dc7f1dABC1067cE36Db7d248b4A9F6Aea4f3'

async function tvl(api) {
  const bal = await api.call({ abi: 'erc20:balanceOf', target: PQUSD, params: [POOL] })
  api.add(PQUSD, bal)
}

async function pool2(api) {
  const bal = await api.call({ abi: 'erc20:balanceOf', target: WQVTX, params: [POOL] })
  api.add(WQVTX, bal)
}

module.exports = {
  methodology: 'TVL = pQUSD locked in the wQVTX/pQUSD liquidity pool on Polygon. Pool2 = wQVTX (native token) locked in the same pool.',
  polygon: { tvl, pool2 },
}
