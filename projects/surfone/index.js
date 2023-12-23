const factoryContract = '0x5FeD7c030a1B3b40988984479Fdd666dE81038A3'

async function tvl(timestamp, block, chainBlock, { api }) {
  const data = await api.call({ abi: abi.getAllPools, target: factoryContract })
  const ownerTokens = data.map(i => [[i.baseToken], i.pool])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  start: 8048857,
  base: { tvl, },
  methodology: "Count the total balance across all fee pools for all trading pairs.",
}

const abi = {
  "getAllPools": "function getAllPools() view returns (tuple(address baseToken, address spotToken, bytes32 spotTokenKey,string baseName,string spotName,uint24 feeP,address pool,uint256 index,uint8 groupIndex, uint256 chainId,bool reverse,uint256 flag)[])"
}