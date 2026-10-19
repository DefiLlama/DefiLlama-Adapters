const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "totalSupply": "function totalSupply(uint256 _assetID) view returns (uint256)"
}
const { default: BigNumber } = require('bignumber.js');

// The provided address should be the FujiERC1155 contract that returns
// totalSupply() for token `ids` indicated.
const ethereumContracts = {
  weth: [
    {
      name: "MainnetF1155Core_VaultsETH",
      address: "0x1Cf24e4eC41DA581bEe223E1affEBB62a5A95484",
      ids: [0, 2, 4],
    },
    {
      name: "MainnetF1155Fuse_VaultsETH",
      address: "0xa2d62f8b02225fbFA1cf8bF206C8106bDF4c692b",
      ids: [0, 2],
    },
  ],
};

const fantomContracts = {
  fantom: [
    {
      name: "FantomF1155Core_VaultsFTM",
      address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
      ids: [0, 2],
    },
  ],
  wbtc: [
    {
      name: "FantomF1155Core_VaultsWBTC",
      address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
      ids: [4],
    },
  ],
  weth: [
    {
      name: "FantomF1155Core_VaultsWETH",
      address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
      ids: [6,8],
    },
  ],
};

const polygonContracts = {
  matic: [{
    name: "PolygonF1155Core_VaultsMATIC",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [0, 2],
  }],
  wbtc: [{
    name: "PolygonF1155Core_VaultsWBTC",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [4, 6],
  }],
  weth: [{
    name: "PolygonF1155Core_VaultsWETH",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [8, 10],
  }],
  usdc: [{
    name: "PolygonF1155Core_VaultsUSDC",
    address: "0x03BD587Fe413D59A20F32Fc75f31bDE1dD1CD6c9",
    ids: [16, 18],
  }],
};

const arbitrumContracts = {
  weth: [{
    name: "ArbitrumF1155Core_VaultsWETH",
    address: "0x3E57e261F1420f11688783534dd4a462a6B63bbc",
    ids: [0, 2],
  }],
  usdc: [{
    name: "ArbitrumF1155Core_VaultsUSDC",
    address: "0x3E57e261F1420f11688783534dd4a462a6B63bbc",
    ids: [4],
  }],
};

const optimismContracts = {
  weth: [{
    name: "optimismF1155Core_VaultsWETH",
    address: "0x3E57e261F1420f11688783534dd4a462a6B63bbc",
    ids: [0],
  }],
  usdc: [{
    name: "optimismF1155Core_VaultsUSDC",
    address: "0x3E57e261F1420f11688783534dd4a462a6B63bbc",
    ids: [2],
  }],
};

const marketsupply = async (contract, api) => {
    return await api.multiCall(
        {
            abi: abi.totalSupply,
            calls: (contract.ids).map(id => ({
                target: (contract.address),
                params: [id]
            })),
        }
    );
}

const allMarketSupplies = async (contracts, api) => {
    let allMarkets;
    for (let index = 0; index < contracts.length; index++) {
        if (!allMarkets) {
            allMarkets = await marketsupply(contracts[index], api);
        } else {
            let temp = allMarkets;
            let response = await marketsupply(contracts[index], api);
            response = response;
            allMarkets = temp.concat(response);
        }
    }
    return allMarkets.reduce((t, v) => t.plus(v), BigNumber(0)).toFixed(0);
}

async function eth(api) {
    const supplies = await allMarketSupplies(ethereumContracts.weth, api)
    api.add(ADDRESSES.ethereum.WETH, supplies)
}

async function fantom(api) {
    const ftmSupplies = await allMarketSupplies(fantomContracts.fantom, api);
    const wbtcSupplies = await allMarketSupplies(fantomContracts.wbtc, api);
    const wethSupplies = await allMarketSupplies(fantomContracts.weth, api);
    api.add(ADDRESSES.fantom.WFTM, ftmSupplies)
    api.add(ADDRESSES.fantom.WBTC, wbtcSupplies)
    api.add(ADDRESSES.fantom.WETH, wethSupplies)
}

async function polygon(api) {
    const maticSupplies = await allMarketSupplies(polygonContracts.matic, api);
    const wbtcSupplies = await allMarketSupplies(polygonContracts.wbtc, api);
    const wethSupplies = await allMarketSupplies(polygonContracts.weth, api);
    const usdcSupplies = await allMarketSupplies(polygonContracts.usdc, api);

    api.add(ADDRESSES.polygon.WMATIC_2, maticSupplies)
    api.add(ADDRESSES.polygon.WBTC, wbtcSupplies)
    api.add(ADDRESSES.polygon.WETH_1, wethSupplies)
    api.add(ADDRESSES.polygon.USDC_CIRCLE, usdcSupplies)
}

async function arbitrum(api) {
    const wethSupplies = await allMarketSupplies(arbitrumContracts.weth, api);
    const usdcSupplies = await allMarketSupplies(arbitrumContracts.usdc, api);
    api.add(ADDRESSES.arbitrum.WETH, wethSupplies)
    api.add(ADDRESSES.arbitrum.USDC_CIRCLE, usdcSupplies)
}

async function optimism(api) {
    const wethSupplies = await allMarketSupplies(optimismContracts.weth, api);
    const usdcSupplies = await allMarketSupplies(optimismContracts.usdc, api);
    api.add(ADDRESSES.optimism.WETH, wethSupplies)
    api.add(ADDRESSES.optimism.USDC_CIRCLE, usdcSupplies)
}

module.exports = {
    methodology: "Counts on-chain balance of receipt tokens in F1155 contracts for all vaults.",
    ethereum: {
        tvl: eth
    },
    fantom: {
        tvl: fantom
    },
    polygon: {
        tvl: polygon
    },
    arbitrum: {
        tvl: arbitrum
    },
    optimism: {
        tvl: optimism
    },
}