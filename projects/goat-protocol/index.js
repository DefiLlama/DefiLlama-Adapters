const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')

const tokenAPI = "address:asset";
const balanceAPI = "uint256:totalAssets"
const GOA_TOKEN_CONTRACT = '0x8c6Bd546fB8B53fE371654a0E54D7a5bD484b319';
const REWARD_POOL_CONTRACT = '0xAD9CE8580a1Cd887038405275cB02443E8fb88aC';

const chains = {
    arbitrum: 42161
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    hallmarks: [
        [1732186800, "Multistrategies Launch"]
    ],
    ...Object.keys(chains).reduce((acc, chain) => {
        acc[chain] = {
            tvl: async (_, _b, { [chain]: block }) => {
                const multistrategies = await getConfig('goat-protocol',`https://api.goat.fi/multistrategies`);
                const vaults = multistrategies.filter(multistrategy => multistrategy.chain === chain).map(multistrategy => multistrategy.address);

                return yieldHelper({vaults, chain, block, tokenAPI, balanceAPI, useDefaultCoreAssets: true});
            },
            ...(chain === 'arbitrum' && {
                staking: staking(REWARD_POOL_CONTRACT, GOA_TOKEN_CONTRACT),
            }),
        };
        return acc;
    }, {}),
}