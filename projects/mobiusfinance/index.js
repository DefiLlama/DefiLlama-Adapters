const ADDRESSES = require('../helper/coreAssets.json')
const formatBytes32String = require('ethers').utils.formatBytes32String;
const { sumTokens, } = require('../helper/unwrapLPs')
const { transformPolygonAddress } = require('../helper/portedTokens')
const ResolverAddr = "0x1E02cdbbA6729B6470de81Ad4D2cCA4c514521b9"

const ResolverJson = {
  getAsset: "function getAsset(bytes32 assetType, bytes32 assetName) view returns (bool, address)",
  getAssets: "function getAssets(bytes32 assetType) view returns (bytes32[])",
  getAddress: "function getAddress(bytes32 name) view returns (address)",
}

const sdk = require('@defillama/sdk')
const chain = 'polygon'
const nullAddr = ADDRESSES.null
const motToken = '0x2db0Db271a10661e7090b6758350E18F6798a49D'

async function tvl(ts, _block, { polygon: block }) {
  const mobiusStr = formatBytes32String("Mobius")
  const stakeStr = formatBytes32String("Stake")
  const motStr = formatBytes32String("MOT")
  const balances = {}
  const transform = await transformPolygonAddress()

  const [
    MobiusAddr,
    Collaterals,
  ] = await Promise.all([
    sdk.api.abi.call({
      target: ResolverAddr, abi: ResolverJson.getAddress, params: [mobiusStr], block, chain,
    }),
    sdk.api.abi.call({
      target: ResolverAddr, abi: ResolverJson.getAssets, params: [stakeStr], block, chain,
    }),
  ]).then(o => o.map(i => i.output))

  await Promise.all(Collaterals.map(async collateral => {

    if (collateral === motStr)
      return;

    let { output: r } = await sdk.api.abi.call({
      target: ResolverAddr, abi: ResolverJson.getAsset, params: [stakeStr, collateral], block, chain,
    })

    if (!r[0])
      return;


    if (r[1] == nullAddr) {
      const response = await sdk.api.eth.getBalance({ target: MobiusAddr, block, chain, })
      sdk.util.sumSingleBalance(balances, transform(nullAddr), response.output)
    } else {
      const response = await sdk.api.erc20.balanceOf({ target: r[1], owner: MobiusAddr, block, chain, })
      sdk.util.sumSingleBalance(balances, transform(r[1]), response.output)
    }
  }))

  return balances
}

async function staking(ts, _block, { polygon: block }) {
  const mobiusStr = formatBytes32String("Mobius")

  const [
    MobiusAddr,
  ] = await Promise.all([
    sdk.api.abi.call({
      target: ResolverAddr, abi: ResolverJson.getAddress, params: [mobiusStr], block, chain,
    }),
  ]).then(o => o.map(i => i.output))

  return sumTokens({}, [[motToken, MobiusAddr]], block, chain)
}

async function pool2(ts, _block, { polygon: block }) {
  const rewardAddrStr = formatBytes32String("RewardStaking")

  const [
    rewardAddr,
  ] = await Promise.all([
    sdk.api.abi.call({
      target: ResolverAddr, abi: ResolverJson.getAddress, params: [rewardAddrStr], block, chain,
    }),
  ]).then(o => o.map(i => i.output))
  const toa = [
    '0x162b21ba1a90dd9384c615192fa4053217d2a8db',
    '0x53add4c98b2787f690042771ca8e512a5793e9c9',
    '0x49d8136336e3feb7128c12172ae5ff78238a88be',
  ].map(t => [t, rewardAddr])

  return sumTokens({}, toa, block, chain, undefined, { resolveLP: true,})
}

module.exports = {
  polygon: {
    tvl,
    staking,
    pool2,
  },
}
