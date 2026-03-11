const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "totalSupply": "function totalSupply(uint256 _assetID) view returns (uint256)"
}
const { default: BigNumber } = require('bignumber.js');
const { ethereumContracts } = require('./ethereum');
const { fantomContracts } = require('./fantom');
const { polygonContracts } = require('./polygon');
const { arbitrumContracts } = require('./arbitrum');
const { optimismContracts } = require('./optimism');

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