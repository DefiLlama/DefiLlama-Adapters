const { getConfig } = require('../helper/cache')

const { addFraxVaultToTVL } = require("./fraxVault");
const { stakings } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');

const blacklists = {
  ethereum: ['0xcF9273BA04b875F94E4A9D8914bbD6b3C1f08EDb', '0x77e88cA17A6D384DCBB13747F6767F30e3753e63'],
  base: ['0x023577b99e8A59ac18454161EecD840Bd648D782'],

}

const chains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base', 'hemi']

const veVCX = "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A";
const WETH_VCX_BAL_LP_TOKEN = "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920";
const stVCX = "0xE5d383FC43F6c370DdD3975cf9e363Ad42367697";
const VCX = "0xce246eea10988c495b4a90a905ee9237a0f91543";

const fraxLockVaultsNotRegistered = [
  "0x44a7b29335cfc61C2bEA1c48710A1fE11f4aFBa9",
  "0x1F0a3bF1e4Ea8f27449AFa0a3A27eFc3817431fc",
  "0xDc5Ed7b972710594082479AF498B1dA02d03a273",
];

const abis = {
  getRegisteredAddresses: 'address[]:getRegisteredAddresses',
  asset: 'address:asset',
  totalAssets: 'uint256:totalAssets'
}

const getHemiTvl = async (api) => {
  const totalAsset = await api.call({ abi: abis.totalAssets, target: "0x748973D83d499019840880f61B32F1f83B46f1A5" });
  api.add("0x8BB97A618211695f5a6a889faC3546D1a573ea77", totalAsset, { skipChain: true })
}

const getArbTvl = async (balances, api, vaults) => {
  const fraxLockVaults = await api.call({ target: "0x25172C73958064f9ABc757ffc63EB859D7dc2219", abi: abis.getRegisteredAddresses });
  const allFraxs = fraxLockVaults.concat(fraxLockVaultsNotRegistered)
  const filteredVaults = vaults.filter((address) => !allFraxs.includes(address))
  const assets = await api.multiCall({ abi: abis.asset, calls: filteredVaults });
  const totalAssets = await api.multiCall({ abi: abis.totalAssets, calls: filteredVaults });
  await addFraxVaultToTVL(balances, api);
  api.add(assets, totalAssets)
  return balances
}

const tvl = async (api) => {
  const balances = {}
  const chain = api.chain
  const chainId = api.getChainId()
  const blacklistTokens = blacklists[chain] ?? []
  const data = await getConfig('popcorn/' + api.chain, `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/${chainId}.json`);
  const vaults = Object.keys(data).filter(i => !blacklistTokens.includes(i));
  if (chain === 'hemi') return getHemiTvl(api)
  if (chain === 'arbitrum') return getArbTvl(balances, api, vaults)

  const assets = await api.multiCall({ abi: abis.asset, calls: vaults })
  const totalAssets = await api.multiCall({ abi: abis.totalAssets, calls: vaults, permitFailure: true })
  api.add(assets, totalAssets.map(i => i || 0))
  return sumTokens2({ api, resolveLP: true })
}

chains.forEach((chain) => {
  module.exports[chain] = { 
    tvl,
    ...(chain === 'ethereum' && {
      staking: stakings([stVCX, veVCX], [VCX, WETH_VCX_BAL_LP_TOKEN]),
    })
   }
})

