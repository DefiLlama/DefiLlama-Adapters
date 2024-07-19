const rTokens = [
  '0x5e17abe30f0b804730c4e4db0ad217d8c29d05a0', // rsTAO
  '0xcD7D22146ea9F26d0208848B6a1A9d1Bb538245A', // rsCOMAI
  '0x3d8ede6231243d56e7896477789a450ce7fd2ad3' //  rsNMT
 ]

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address:wrappedToken', calls: rTokens})
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: rTokens})
  api.add(tokens, supplies)  
}

module.exports = {
  methodology: "TVL is calculated as the sum of the total supplies of rsTAO, rsCOMAI and rsNMT tokens.",
  ethereum: {
    tvl,
  }
};
