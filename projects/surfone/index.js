const factoryContract = '0x5FeD7c030a1B3b40988984479Fdd666dE81038A3'
const positionContract = '0x1fa9702e774D31aB661D84f449b0Aa22c41D6827'
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const data = await api.call({ abi: abi.getAllPools, target: factoryContract })
  const ownerTokens = data.map(i => [[i.baseToken], i.pool])
  ownerTokens.push([[ADDRESSES.base.USDC, ADDRESSES.base.WETH], positionContract])
  return api.sumTokens({ ownerTokens, });
}


module.exports = {
  start: 8048857,
  base: { tvl },
  methodology: "Count the total balance across all fee pools for all trading pairs.",
}

const abi = {
  "getAllPools": "function getAllPools() view returns (tuple(address baseToken, address spotToken, bytes32 spotTokenKey,string baseName,string spotName,uint24 feeP,address pool,uint256 index,uint8 groupIndex, uint256 chainId,bool reverse,uint256 flag)[])"
}
