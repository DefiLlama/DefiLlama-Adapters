const SFLR = "0x12e605bc104e93B45e1aD99F9e555f659051c2BB";

async function tvl(api) {
  const pooledFlr = await api.call({ abi: "uint256:totalPooledFlr", target: SFLR })
  api.addGasToken(pooledFlr)
}

module.exports = {
  flare: {
    tvl,
  },
  methodology: "Counts staked FLR tokens.",
}