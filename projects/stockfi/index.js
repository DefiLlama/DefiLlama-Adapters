const { getLogs2 } = require("../helper/cache/getLogs");
const { ethers } = require("ethers");
const { PromisePool } = require("@supercharge/promise-pool");
const { treasuryExports } = require("../helper/treasury");

const VAULT_REGISTRY = "0x9732A52eB6BAc678BbC95F6C06Ba70a5b2071379";
const EVENT_ABI = "event VaultRegistered(address indexed vault, address indexed baseToken)";

async function tvl(api) {

    const vaults = await getLogs2({
        api,
        target: VAULT_REGISTRY,
        eventAbi: EVENT_ABI,
        fromBlock: 80743203,
    });

    const pools = [];
    for (const vaultData of vaults) {
        // Collateral token is NOT the baseToken emitted by VaultRegistered
        // Reading directly from storage        
        const collateralToken = await api.provider.getStorage(vaultData.vault, "0x78");
        if (!collateralToken || collateralToken === ethers.ZeroHash) {
            return null;
        } else {
            const token = ethers.getAddress("0x" + collateralToken.slice(-40));
            pools.push({ vault: vaultData.vault, collateral: token });
        };
    };

    const validPools = pools.filter(Boolean);
    await api.sumTokens({ 
        tokensAndOwners: validPools.map(i => [i.collateral, i.vault])
    });
};

module.exports = {
    methodology: "Value of deposited collateral assets across all vaults.",
    bsc: { tvl },
};
