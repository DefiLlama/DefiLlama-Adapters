const { getUniTVL } = require('../helper/unknownTokens');
const { sumTokens2 } = require('../helper/unwrapLPs');

const klayDelegate = require("./abis/klayDelegate.json");

const GPC = '0x27397bfbefd58a437f2636f80a8e70cfc363d4ff';
const GHUB = '0x4836cc1f355bb2a61c210eaa0cd3f729160cd95e';

const singleDepositContracts = [
    {
        address: '0x4d55B04AC52b2CA41ad04337FF13CbAefbdC8954', 
        token: GPC
    }, {
        address: '0x4d55B04AC52b2CA41ad04337FF13CbAefbdC8954',
        token: GHUB
    }
]

const klayStakingContract = '0x6569B14043c03537B5B125F5Ac5De3605a47dC76';

async function findBalances(contracts, api) {
    const tokensAndOwners = contracts.map(i => ([i.token, i.address]));
    return sumTokens2({ api, tokensAndOwners });
}

async function singleDepositPool(api) {
    return await findBalances(singleDepositContracts, api);
}

async function klayStaking(api) {
    const totalStaked = await api.call({
        target: klayStakingContract,
        abi: klayDelegate["totalStaked"],
    });
    api.add("KLAY", totalStaked);
}

module.exports = {
    klaytn: {
        tvl: getUniTVL({ factory: '0x347E5ce6764DF9DF85487BEA523D3e242762aE88', useDefaultCoreAssets: true}),
        pool2: singleDepositPool,
        staking: klayStaking
    }
}

