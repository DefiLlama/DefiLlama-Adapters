const sdk = require("@defillama/sdk")
const swkava  = '0x9d9682577CA889c882412056669bd936894663fd'
const swech   = '0x86e4D91800c03e803d4c8FA3293d1C7d612A7300'


async function kava(timestamp, ethBlock, {kava: block}) {
  const chain = "kava"
  const pooledCoin = await sdk.api.abi.call({
    block,
    chain,
    target: swkava,
    abi: "uint256:totalSupply",
  })
  return {
    'kava': Number(pooledCoin.output)/1e18,
  }
}

async function echelon(timestamp, ethBlock, {echelon: block}) {
  const chain = "echelon"
  const pooledCoin = await sdk.api.abi.call({
    block,
    chain,
    target: swech,
    abi: "uint256:totalSupply",
  })
  return {
    'echelon': Number(pooledCoin.output)/1e18,
  }
}



module.exports = {
  kava: {
    tvl: kava
  }
}
