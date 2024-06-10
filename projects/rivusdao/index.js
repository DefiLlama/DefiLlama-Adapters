const rTokens = [
  '0xdad3d3c5cac4f2c8eca2b483aba9e928a4b88783', // rsTAO
  '0xae173ac44c0041cda87907f52a1e531934e49610' // rsCOMAI
]

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address:wrappedToken', calls: rTokens})
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: rTokens})
  api.add(tokens, supplies)  
}

module.exports = {
  methodology: "TVL is calculated as the sum of the total supplies of rsTAO and rsCOMAI tokens.",
  ethereum: {
    tvl,
  }
};
