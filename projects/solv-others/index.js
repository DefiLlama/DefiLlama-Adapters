const { sumTokens2, } = require("../helper/unwrapLPs");
const { getConfig } = require("../helper/cache");

const solvOthersListUrl = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solv-others.json';

async function tvl(api) {
    let solvOthers = (await getConfig('solv-protocol/solv-others', solvOthersListUrl));

    await otherDeposit(api, solvOthers);
}

async function otherDeposit(api, solvOthers) {
    if (!solvOthers[api.chain] || !solvOthers[api.chain]["otherDeposit"]) {
        return;
    }
    let otherDeposit = solvOthers[api.chain]["otherDeposit"];

    let tokensAndOwners = []
    for (const deposit of otherDeposit["depositAddress"]) {
        for (const tokenAddress of otherDeposit["tokens"]) {
            tokensAndOwners.push([tokenAddress, deposit])
        }
    }

    await sumTokens2({ api, tokensAndOwners, permitFailure: true });
}

['merlin'].forEach(chain => {
    module.exports[chain] = {
        tvl
    }
})