const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

// Ethereum
const ETH_BULL_VAULT = "0xad48a8261b0690c71b70115035eb14afd9a43242";

// Optimism
const BASIS_TRADING_VAULT = "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859";

// Arbitrum
const DMO_LENDING_POOL = "0x4c51FF6AF2EfC679A08C5A7377Bce18050f86CcB";
const DMO_FACTORY = "0xcd8d2e1fa4132749220ffeec165285ee33028d59";
const DMO_FARM = "0x4a127cB6806E869bf61A6de9db76dabE46A837D3";
const DMO_FARM_ACTION = "0x4Ec4e76c11E2182918a80822df114DB03048388b";

async function ethTvl(api) {
  api.add(ADDRESSES.ethereum.WETH, (await api.call({ target: ETH_BULL_VAULT, abi: abi.totalAsset })))
}

async function optTvl(api) {
  api.add(ADDRESSES.optimism.USDC, (await api.call({ target: BASIS_TRADING_VAULT, abi: abi.totalAssets })))
}

async function getOpenPositionIds() {
  const response = await getConfig('diamond/arbi-open-positions',
          "https://0dtklop9zj.execute-api.ap-northeast-1.amazonaws.com/stag/open_positions?limit=500"
        )

  const positionIds = response.records.map((position) => position.PositionId);

  return positionIds;
}

async function getTotalPositionValue(api) {
  const openPositionIds = await getOpenPositionIds();
  const infos = await api.multiCall({  abi: abi.getPositionInfo, calls: openPositionIds, target: DMO_FACTORY, permitFailure: true })
  infos.forEach((i ) => {
    if (!i) return;
    api.add(ADDRESSES.arbitrum.USDC, i.positionValue)
  })
}

async function arbTvl(api) {
  const balanceOfPool = await api.call({  abi: abi.getCash, target: DMO_LENDING_POOL})
  const balanceOfFarm = await api.call({ abi: abi.totalAssets, target: DMO_FARM })
  api.add(ADDRESSES.arbitrum.WETH, balanceOfPool)
  api.add(ADDRESSES.arbitrum.USDC, balanceOfFarm)

  await getTotalPositionValue(api);


  return sumTokens2({
    api,
    owners: [DMO_FACTORY, DMO_FARM_ACTION, ],
    tokens: [ADDRESSES.arbitrum.USDC],
  })
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  optimism: {
    tvl: optTvl,
  },
  arbitrum: {
    tvl: arbTvl,
  },
};
