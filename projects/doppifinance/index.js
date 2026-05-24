const { abi } = require('./helper.js')
const ADDRESSES = require("../helper/coreAssets.json");

const doppiCore = [
  '0xa2d49d1c8b89Cd0b11AeA445887661CDcF9e9611',
  '0x8532f74529F4295f882f73Cd3D3cCfBcD6900e08',
]
const doppiLP = [
  '0x2deB22F6fCFE371c5024b52045850d9B32d33Bcd',
  '0x9b0e4260311a8874a0f7EeDB9545e93960e113c6',
]
const doppiTraderFactory = [
  '0x095e4C543839c3C0403DbC5AA8acC259689A419C',
  '0xAB0a39Ee19797E273c94737100D811498Bf2e75E',
]
const botTokens = [
  ADDRESSES.bsc.USDT,
  ADDRESSES.bsc.BTCB,
  ADDRESSES.bsc.ETH,
]
const excludeBots = [
    '0x3A296c9191e7698091661C337b68b5E7B18Ed610',
  ].map(i => i.toLowerCase());

async function tvl(api) {

  await getTraderBots(api)
  const lpBal = await api.multiCall({ abi: abi.totalAssetsInAssetA, calls: doppiLP })
  const coreBal = await api.multiCall({abi: abi.getCurrentDeposits,calls: doppiCore.map(target => ({ target, params: [true] }))})

  api.add(ADDRESSES.bsc.USDT, lpBal)
  api.add(ADDRESSES.bsc.USDT, coreBal)
}


async function getTraderBots(api) {
  // 1. Get nextBotId from all factories
  const nextBotIds = await api.multiCall({
    abi: abi.getNextBotId,
    calls: doppiTraderFactory
  });

  // 2. Construct all bot address calls via flatMap
  const addressCalls = doppiTraderFactory.flatMap((factory, i) => {
    const lastId = Number(nextBotIds[i]) - 1;
    if (lastId < 1) return [];
    return Array.from({ length: lastId }, (_, j) => ({ target: factory, params: [j + 1] }));
  });

  // 3. Fetch all bot addresses in ONE multiCall
  let botAddresses = await api.multiCall({
    abi: abi.traderBots,
    calls: addressCalls
  });

  // 4. Remove excluded bots
  botAddresses = botAddresses.filter(
    addr => addr && !excludeBots.includes(addr.toLowerCase())
  );

  // 5. Fetch balances for tracked bot tokens
  const tokenBalances = await Promise.all(
    botTokens.map(target => api.multiCall({
      abi: 'erc20:balanceOf',
      target,
      calls: botAddresses,
    }))
  )

  botTokens.forEach((token, i) => api.add(token, tokenBalances[i]))
}


module.exports = {
  doublecounted: true,
  bsc: {
    tvl: tvl,
  },
  methodology: "Get all Doppi Finance TVL including Doppi Core, Liquidity Pool and Trader Bots balance for all trading pairs",
};
