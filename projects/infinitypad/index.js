const { stakings, staking, } = require("../helper/staking");
const contracts = {
    "chains": [
      "bsc",
      "celo",
      "fuse"
    ],
    "stakingContractBsc": "0xcf5180580c3c300cd9714d28813d4907123b0490",
    "stakingTokenBsc": "0xf07dfc2ad28ab5b09e8602418d2873fcb95e1744",
    "stakingTokenLp": "0x1998be7f13608e62eac2da735d88a576db3d9eea"
  };
const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require("../helper/unwrapLPs");

async function fetchBalances(api, contracts) {
    const data = contracts[api.chain]
    if (!data) return api.getBalances();
    return sumTokens2({ api, tokensAndOwners: Object.values(data).map(c => ([c.tokenAddress, c.tokenHolder])), blacklistedTokens: ['0x3dde01a467f99e58f996de835058c767a3edd2ac']})
}

// node test.js projects/infinitypad/index.js
function tvl() {
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