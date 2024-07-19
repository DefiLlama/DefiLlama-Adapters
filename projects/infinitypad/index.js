const sdk = require("@defillama/sdk");
const { stakings, staking, } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");
const contracts = require("./contracts.json");
const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require("../helper/unwrapLPs");

async function fetchBalances(api, contracts) {
    const data = contracts[api.chain]
    if (!data) return api.getBalances();
    return sumTokens2({ api, tokensAndOwners: Object.values(data).map(c => ([c.tokenAddress, c.tokenHolder])), blacklistedTokens: ['0x3dde01a467f99e58f996de835058c767a3edd2ac']})
}

// node test.js projects/infinitypad/index.js
function tvl(chain) {
    return async (api) => {
        const vestingContracts = (await getConfig('infinitypad', "https://api.infinitypad.com/get-all-vesting-contracts"));
        const clientVesting = {};
        for (const vestingContract of vestingContracts) {
            if (!clientVesting[vestingContract.chain_name]) {
                clientVesting[vestingContract.chain_name] = {};
            }
            clientVesting[vestingContract.chain_name][vestingContract.vesting_smart_contract_address] = {
                tokenHolder: vestingContract.vesting_smart_contract_address,
                tokenAddress: vestingContract.token_address
            };
        }

        return fetchBalances(api, clientVesting)
    };
}

const chainTVLObject = contracts.chains.reduce(
    (agg, chain) => ({ ...agg, [chain]: { tvl: tvl(chain) } }), {}
);

chainTVLObject.bsc.staking = stakings(
    [contracts.stakingContractBsc],
    contracts.stakingTokenBsc,
);

chainTVLObject.bsc.pool2 = staking(
    [contracts.stakingContractBsc],
    [contracts.stakingTokenLp],
);

module.exports = {
    ...chainTVLObject
};