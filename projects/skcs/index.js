const sdk = require('@defillama/sdk')


async function tvl(timestamp, ethBlock, {kcc: block}) {
  const chain = "kcc"
  const totalLockedKCS = await sdk.api.abi.call({
    block,
    chain,
    target: "0x3CEF6d63C299938083D0c89C812d9C6985e3Af1c",
    abi: "uint256:getLatestLockedKCS"
  })

  return {'kucoin-shares':Number(totalLockedKCS.output / 1e18)}
}


module.exports = {
      methodology: 'Staked token and staking rewards are counted as TVL',
  start: 12145436,
  kcc:{
    tvl:tvl,
  }

};
