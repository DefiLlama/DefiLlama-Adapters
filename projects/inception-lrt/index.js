const ADDRESSES = require('../helper/coreAssets.json')

async function tvl_eth(api) {
  const vaults = ['0x36B429439AB227fAB170A4dFb3321741c8815e55', '0xfE715358368416E01d3A961D3a037b7359735d5e', '0x90E80E25ABDB6205B08DeBa29a87f7eb039023C2', '0x4878F636A9Aa314B776Ac51A25021C44CAF86bEd', '0xA9F8c770661BeE8DF2D026edB1Cb6FF763C780FF', '0x1Aa53BC4Beb82aDf7f5EDEE9e3bBF3434aD59F12', '0x814CC6B8fd2555845541FB843f37418b05977d8d', '0xc4181dC7BB31453C4A48689ce0CBe975e495321c', '0xC0660932C5dCaD4A1409b7975d147203B1e9A2B6', '0x6E17a8b5D33e6DBdB9fC61d758BF554b6AD93322', '0x295234B7E370a5Db2D2447aCA83bc7448f151161', '0xd0ee89d82183D7Ddaef14C6b4fC0AA742F426355']
  const total_deposited = await api.multiCall({  abi: 'uint256:getTotalDeposited', calls: vaults, permitFailure: true})
  // const total_withdraw = await api.multiCall({  abi: 'uint256:totalAmountToWithdraw', calls: vaults, permitFailure: true})
  const strategies = await api.multiCall({  abi: 'address:strategy', calls: vaults})
  const tokens = await api.multiCall({  abi: 'address:underlyingToken', calls: strategies})
  // const result = total_deposited.map((deposited, index) => deposited - total_withdraw[index]);
  const staked = await api.call({  abi: 'uint256:totalAssets', target: '0xf073bAC22DAb7FaF4a3Dd6c6189a70D54110525C'})
  api.add(ADDRESSES.null, staked)
  api.add(tokens, total_deposited)
}

async function tvl_linea(api) {
  const staked = await api.call({  abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d'})
  api.add(ADDRESSES.null, staked)
}

async function tvl_mode(api) {
  const staked = await api.call({  abi: 'uint256:totalAssets', target: '0x5a7a183b6b44dc4ec2e3d2ef43f98c5152b1d76d'})
  api.add(ADDRESSES.null, staked)
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl: tvl_eth, } ,
  linea: { tvl: tvl_linea, } ,
  mode: { tvl: tvl_mode, } ,
}
