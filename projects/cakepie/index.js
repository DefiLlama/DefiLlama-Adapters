const CakepieReaderAbi = require("./abis/CakepieReader.json");
const MasterCakepieAbi = require("./abis/MasterCakepie.json");
const config = require("./config")
const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

async function tvl(api) {
  const { PancakeStaking, CakepieReader, MasterCakepieAddress, CakeAddress, } = config[api.chain];
  const masterChefV3 = await api.call({ abi: CakepieReaderAbi.masterChefv3, target: CakepieReader })
  const mCake = await api.call({ abi: CakepieReaderAbi.mCake, target: CakepieReader })
  const mCakeSV = await api.call({ abi: CakepieReaderAbi.mCakeSV, target: CakepieReader })
  await sumTokens2({ api, uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, PancakeStaking]], uniV3ExtraConfig: { nftIdFetcher: masterChefV3 }})
  const mCakePool = await api.call({ abi: MasterCakepieAbi.tokenToPoolInfo, target: MasterCakepieAddress, params :[mCake] })
  const mCakeSVPool = await api.call({ abi: MasterCakepieAbi.tokenToPoolInfo, target: MasterCakepieAddress, params:[mCakeSV] })
  api.add(CakeAddress, mCakePool.totalStaked)
  api.add(CakeAddress, mCakeSVPool.totalStaked)
}

Object.keys(config).forEach((chain) => {
  const { vlCKPAddress, CKPAddress } = config[chain];
  module.exports[chain] = {
    tvl,
  }
  if (vlCKPAddress && CKPAddress) {
    module.exports[chain].staking = staking(vlCKPAddress, CKPAddress)
  }
})