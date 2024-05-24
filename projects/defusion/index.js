async function tvl(api) {
  const supply = await api.call({  abi: 'erc20:totalSupply', target: '0xCdde1f5D971A369eB952192F9a5C367f33a0A891'})
  api.add('0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce', supply)
}

module.exports.tomochain = {
  tvl
} 
