const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/bitcoin.js');
// const { sumTokensExport: sumBRC20TokensExport } = require('../helper/chain/brc20.js');

const POLYGON_LOCKERS_MANAGER_PROXY = '0xf5D6D369A7F4147F720AEAdd4C4f903aE8046166';
const BNB_LOCKERS_MANAGER_PROXY = '0x84F74e97ebab432CeE185d601290cE0A483987A5';
const BSQUARED_LOCKERS_MANAGER_PROXY = '0x20752a82fe75996a582Ae2be1b7C3D4866C5b733';
const BOB_LOCKERS_MANAGER_PROXY = '0xd720996f0D8fFD9154c8271D2991f54E5d93D2A9';
const TST = "0x0828096494ad6252F0F853abFC5b6ec9dfe9fDAd";
const TST_DELEGATION = "0x93AD6C8B3a273E0B4aeeBd6CF03422C885217D3B";

const POLYGON_LOCKER = '3CAQAw7m95axbY761Xq8d9DADhjNaX9b8o';
const BNB_LOCKER = '3KLdeu9maZAfccm3TeRWEmUMuw2e8SLo4v';
const BSQUARED_LOCKER = '3E2hwnq5BsmP1ea6JUhjdKZjh2wy4NuQ8T';
const BOB_LOCKER = '31uHNFfbejkbUD2B26o2CARfU1ALJ6x6Ag';
// const BRC20_LOCKER='3LNsey3ceG9ZHkQ7bcfAjwnew7KVujHt29';

async function bitcoin_tvl() {
    // TODO: add BRC-20 locker
    // TODO: get Bitcoin address of Lockers dynamically
    // Get BTC balance of Lockers
    return await sumTokens({        
        owners: [POLYGON_LOCKER, BNB_LOCKER, BSQUARED_LOCKER, BOB_LOCKER] 
    });
}

async function polygon_tvl(api) {
    // Get Lockers collateral
    const collateralBalance = await sdk.api.eth.getBalance({
        target: POLYGON_LOCKERS_MANAGER_PROXY,
        chain: 'polygon'
    });
    api.add("0x0000000000000000000000000000000000000000", collateralBalance.output)
}

async function bnb_tvl(api) {
    // Get Lockers collateral
    const collateralBalance = await sdk.api.eth.getBalance({
        target: BNB_LOCKERS_MANAGER_PROXY,
        chain: 'bsc'
    });
    api.add("0x0000000000000000000000000000000000000000", collateralBalance.output)
}

async function bsquared_tvl(api) {
    // Get Lockers collateral
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.bsquared.WBTC,
        params: [BSQUARED_LOCKERS_MANAGER_PROXY],
    });
    api.add(ADDRESSES.bsquared.WBTC, collateralBalance)
}

async function bob_tvl(api) {
    // Get Lockers collateral
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.bob.WBTC,
        params: [BOB_LOCKERS_MANAGER_PROXY],
    });
    api.add(ADDRESSES.bob.WBTC, collateralBalance)
}

async function ethereum_tvl(api) {
    // Get delegated TST
    const delegatedBalace = await api.call({
        abi: 'erc20:balanceOf',
        target: TST,
        params: [TST_DELEGATION],
    });
    api.add(TST, delegatedBalace)
}

module.exports = {
    methodology: 'TVL is the sum of all BTC locked by users, collateral locked by Lockers, and TST delegated to Lockers.',
    bitcoin: {
        tvl: bitcoin_tvl,
    },
    polygon: {
        tvl: polygon_tvl,
    },
    bsc: {
        tvl: bnb_tvl,
    },
    bsquared: {
        tvl: bsquared_tvl,
    },
    bob: {
        tvl: bob_tvl,
    },
    ethereum: {
        tvl: ethereum_tvl,
    }
}; 