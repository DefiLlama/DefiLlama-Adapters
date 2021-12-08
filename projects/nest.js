const sdk = require("@defillama/sdk");
const nestToken = '0x04abeda201850ac0124161f037efd70c74ddc74c';
const stakingContract = '0xaA7A74a46EFE0C58FBfDf5c43Da30216a8aa84eC';

async function staking(timestamp, block) {
    let balances = {};
    balances[nestToken] = (await sdk.api.erc20.balanceOf({
        target: nestToken,
        owner: stakingContract,
        block: block
      })).output
    return balances;
};

async function tvl() {
    return {};
};

module.exports = {
    methodology: "Counts NEST tokens that have been staked in the nest dapp",
    ethereum: {
        tvl,
        staking
    },
};
