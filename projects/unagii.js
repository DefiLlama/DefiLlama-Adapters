const sdk = require('@defillama/sdk')
const { getChainTransform } = require('./helper/portedTokens')
const chain = 'ethereum'

async function tvl(_, block) {
  const transform = await getChainTransform(chain)
  const vaults = [
    '0x4aD0b81f92B16624BBcF46FC0030cFBBf8d02376',
    '0xBc5991cCd8cAcEba01edC44C2BB9832712c29cAB',
    '0x178Bf8fD04b47D2De3eF3f6b3D112106375ad584',
    '0x3aF5Ba94C29a8407785f5f6d90eF5d69a8EB2436',
    '0x77607588222e01bf892a29Abab45796A2047fc7b',
  ]

  const v2Vaults = [
    '0x634b0273D7060313FAA60f96705116c9DE50fA1f',
    '0x49b09e7E434a3A4A924A3b640cBBA54bF93B5677',
    '0xBF8734c5A7b3e6D88aa0110beBB37844AC043d0A',
    '0x7F20551E082ba3E035F2890cBD1EC4E275b9C8C0',
    '0xDe07f45688cb6CfAaC398c1485860e186D55996D',
  ]

  const { output: minters } = await sdk.api.abi.multiCall({
    abi: abi.minter,
    calls: v2Vaults.map(i => ({ target: i })),
    chain, block,
  })

  minters.forEach(({ output }) => vaults.push(output))

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.token,
    calls: vaults.map(i => ({ target: i })),
    chain, block,
  })

  const { output: totalAssets } = await sdk.api.abi.multiCall({
    abi: abi.totalAssets,
    calls: vaults.map(i => ({ target: i })),
    chain, block,
  })
  const balances = {}
  tokens.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, transform(output), totalAssets[i].output))
  return balances
}

module.exports = {
  ethereum: {
    tvl
  }
}

const abi = {
  minter: "address:minter",
  token: "address:token",
  totalAssets: "uint256:totalAssets",
}