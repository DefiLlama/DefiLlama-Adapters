const periFinanceContract = {
  ethereum: "0x0207157a7c154bFdEAD22751474c68660A4a540b",
  polygon: "0x8f151e700772d6e8Dc7dA8B260c9e0C3eCbF4174",
  bsc: "0x2Da103C31c4A80f828ea4158bD090e926003e8ad",
  base: "0x0f2Af7246e1FcbEC5e334092B1F0D91BDA924faD",
  moonriver: "0xB2f5Cd646Aab5f887150945576d51a8B5902F288",
  moonbeam: "0x0f2Af7246e1FcbEC5e334092B1F0D91BDA924faD",
}

Object.keys(periFinanceContract).forEach(chain => module.exports[chain] = { tvl })

async function tvl(api) {
  const contract = periFinanceContract[api.chain];
  const pUSD = await api.call({  abi: 'function pUSD() view returns (bytes32)', target: contract})
  const totalIssued = await api.call({  abi: "function totalIssuedPynths(bytes32 currencyKey) view returns (uint256 totalIssued)", target: contract, params: pUSD})
  api.addCGToken("usd-coin", totalIssued * 4 / 1e18)
}
