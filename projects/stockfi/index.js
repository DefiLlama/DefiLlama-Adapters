const { getLogs2 } = require("../helper/cache/getLogs");

const VAULT_REGISTRY = "0x9732A52eB6BAc678BbC95F6C06Ba70a5b2071379";
const EVENT_ABI = "event VaultRegistered(address indexed vault, address indexed baseToken)";

async function tvl(api) {

    const vaults = await getLogs2({
        api,
        target: VAULT_REGISTRY,
        eventAbi: EVENT_ABI,
        fromBlock: 80743203,
    });
    const vaultAddresses = vaults.map(v => v.vault);
    const collaterals = await api.multiCall({
        abi: 'address:collateralToken',
        calls: vaultAddresses,
    });
    await api.sumTokens({ 
        tokensAndOwners: vaultAddresses.map((vault, i) => [collaterals[i], vault])
    });
};

module.exports = {
    methodology: "Value of deposited collateral assets across all vaults.",
    bsc: { tvl },
};
