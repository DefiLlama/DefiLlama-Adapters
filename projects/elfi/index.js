
const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const tradeVault = '0x8772bB60EA1BBA8a7729a90ff1907855FD55ba83'
const lpVault = '0xbC268D619b406bdfCA1B4AC30d50Ba30AB38E96f'
const portfolioVault = '0x9099824Be9aB2b691ce0E478853Cb15Fb81FF677'

const elfUSD = '0x70B8117b3177a7CE42BEe021E89625f27E45b98C'

module.exports = {
  arbitrum: {
    tvl,
  },
};

async function tvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0x153c613D572c050104086c7113d00B76Fbaa5d55',
    eventAbi: 'event MarketCreated (bytes32 code, string stakeTokenName, address indexToken, address baseToken, address stakeToken)',
    fromBlock: 233088372,
  })

  const ownerTokens = logs.map(log => [[log.baseToken, log.indexToken], log.stakeToken])
  ownerTokens.push([[ADDRESSES.arbitrum.USDC_CIRCLE], elfUSD])
  const tokens = ownerTokens.map(([tokens]) => tokens).flat()
  await api.sumTokens({ tokens, owners: [lpVault, portfolioVault, tradeVault] })
  return api.sumTokens({ ownerTokens})
}