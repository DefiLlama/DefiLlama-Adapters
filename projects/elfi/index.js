const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const vaults = {
  'arbitrum': ['0x8772bB60EA1BBA8a7729a90ff1907855FD55ba83', '0xbC268D619b406bdfCA1B4AC30d50Ba30AB38E96f', '0x9099824Be9aB2b691ce0E478853Cb15Fb81FF677'],
  'base': ['0x9099824Be9aB2b691ce0E478853Cb15Fb81FF677', '0x8772bB60EA1BBA8a7729a90ff1907855FD55ba83', '0xb059B996C2Ebf23E77dD3110AE1f334caBF2DeA2'],
}
const elfUSD = {
  'arbitrum': '0x70B8117b3177a7CE42BEe021E89625f27E45b98C',
  'base': '0xc367281626dDbf7fE93229A396AE8E29dE25D5E2'
}
async function arbitrum_tvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0x153c613D572c050104086c7113d00B76Fbaa5d55',
    eventAbi: 'event MarketCreated (bytes32 code, string stakeTokenName, address indexToken, address baseToken, address stakeToken)',
    fromBlock: 233088372,
  })
  const assetTokens = [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.DAI, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.LINK, ADDRESSES.arbitrum.ARB]
  const tokens = logs.reduce((acc, log) =>
    [...acc, log.baseToken, log.indexToken], assetTokens)
  const owners = logs.reduce((acc, log) =>
    [...acc, log.stakeToken], [...vaults.arbitrum, elfUSD.arbitrum])
  return api.sumTokens({ tokens, owners })
}
async function base_tvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0x957e0C2Ea128b0307B5730ff83e0bA508b729d50',
    eventAbi: 'event MarketCreated (bytes32 code, string stakeTokenName, address indexToken, address baseToken, address stakeToken)',
    fromBlock: 26932589,
  })
  const assetTokens = [ADDRESSES.base.USDC, ADDRESSES.base.USDT, ADDRESSES.base.DAI]
  const tokens = logs.reduce((acc, log) =>
    [...acc, log.baseToken, log.indexToken], assetTokens)
  const owners = logs.reduce((acc, log) =>
    [...acc, log.stakeToken], [...vaults.base, elfUSD.base])
  return api.sumTokens({ tokens, owners })
}
module.exports = {
  arbitrum: {
    tvl: arbitrum_tvl,
  },
  base: {
    tvl: base_tvl,
  },
};