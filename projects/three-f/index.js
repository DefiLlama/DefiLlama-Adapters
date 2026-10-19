const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens } = require("../helper/unwrapLPs");

const WRAPPER_ASSET_FACTORY = "0x54f862fa0612a8709f6dec4a7b39af015cd4e82e";
const DEPLOY_EVENT = "event Deployed(address indexed proxy, address indexed implementation, address indexed admin)";

async function tvl(api) {
    const deployEvents = await getLogs2({
        api,
        target: WRAPPER_ASSET_FACTORY,
        eventAbi: DEPLOY_EVENT,
        fromBlock: 24841246
    });

    const wrappedTokens = [];
    for (const deploy of deployEvents) {
        wrappedTokens.push(deploy.proxy);
    };

    const underlyings = await api.multiCall({ 
        abi: "address:underlying", 
        calls: wrappedTokens.map(t => ({ target: t })),
        permitFailure: true,
    });

    const validPairs = wrappedTokens
        .map((vault, i) => ({ vault, token: underlyings[i] }))
        .filter(i => i.token);

    return api.sumTokens({ 
        tokensAndOwners: validPairs.map(i => [i.token, i.vault]) 
    });
};
 

module.exports = {
    methodology: "Value of assets locked inside all wrapper tokens.",
    start: "2026-04-08",
    ethereum: { tvl }
};