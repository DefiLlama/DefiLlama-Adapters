const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const doppiCore = ['0xa2d49d1c8b89Cd0b11AeA445887661CDcF9e9611', '0x8532f74529F4295f882f73Cd3D3cCfBcD6900e08']
const doppiLP = ['0x2deB22F6fCFE371c5024b52045850d9B32d33Bcd', '0x9b0e4260311a8874a0f7EeDB9545e93960e113c6']
const doppiTraderFactory = ['0x095e4C543839c3C0403DbC5AA8acC259689A419C', '0xAB0a39Ee19797E273c94737100D811498Bf2e75E']

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
