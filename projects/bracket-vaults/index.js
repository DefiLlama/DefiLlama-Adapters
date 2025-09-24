const ADDRESSES = require('../helper/coreAssets.json')
const CONFIG = {
  BBOR1: '0x7A859B5aa0E8294be505af730Ec75E81B14d2788', //  ETH+ Vault
  CBOR2: '0xb8ca40E2c5d77F0Bc1Aa88B2689dddB279F7a5eb', //  USDC+ Vault
  brktETH: '0x6C8550167BbD06D4610a6A443eCbEd84Bd1AccD6',
  USDC: ADDRESSES.ethereum.USDC
}

const abis = {
  totalActiveShares: 'uint256:totalActiveShares',
  assetsPerShare: 'uint256:assetsPerShare',
  precision: 'uint256:PRECISION'
}

const tvl = async (api) => {
  const { BBOR1, CBOR2, brktETH } = CONFIG

  const [share, nav, precision] = await Promise.all([
    api.call({ abi: abis.totalActiveShares, target: BBOR1 }),
    api.call({ abi: abis.assetsPerShare, target: BBOR1 }),
    api.call({ abi: abis.precision, target: BBOR1 }),
  ])

  api.add(brktETH, share * nav / precision)
  await api.erc4626Sum({ calls: [CBOR2], tokenAbi: 'address:token', balanceAbi: 'uint256:activeSupply' })
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl }
}