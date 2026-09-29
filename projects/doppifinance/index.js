const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const doppiCore = ['0x469362685d424C458e3CeDF5F293a746932bBc26']
const doppiLP = ['0x9CaA7f14aafC28Ab6e3e2b47362211c1862D30C6']
const doppiTraderFactory = ['0x95B6758a05B6CE9aE4E14f579e959eE5471f6d5D', '0x7aF174BEddb1059d6f31a60f35Ea4911D6447A07', '0x2C71cd52B60979126Db275D278612b33e5aAbc1d']

const excludeBots = ['0x3A296c9191e7698091661C337b68b5E7B18Ed610'].map(i => i.toLowerCase());

async function tvl(api) {
  const botAddresses = await api.fetchList({
    lengthAbi: 'function getNextBotId() external view returns (uint32)',
    itemAbi: 'function traderBots(uint32 _id) external view returns (address)',
    targets: doppiTraderFactory,
    startFromOne: true,
  })
  const filteredBots = botAddresses.filter(
    addr => addr && !excludeBots.includes(addr.toLowerCase())
  )
  return sumTokens2({
    api,
    owners: [...doppiCore, ...doppiLP, ...filteredBots],
    tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.BTCB, ADDRESSES.bsc.ETH],
  })
}

module.exports = {
  bsc: { tvl },
  methodology: "Get all Doppi Finance TVL including Doppi Core, Liquidity Pool and Trader Bots balance for all trading pairs",
};
