
async function tvl(api) {
  const pooledFTNInUSD = await api.call({ target: '0x831fc32221924f8a6d47251327ef67ebcc5cd6dc', abi: "uint256:getGeneralInfo" })

  return {
    'coingecko:fasttoken': pooledFTNInUSD / 1e18,
  }
}

module.exports = {
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
  ftn: { tvl },
}
