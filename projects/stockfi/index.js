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
    
    const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC || "https://bsc-dataseed.binance.org");
    
    const {results: poolData, errors } = await PromisePool
        .withConcurrency(5)
        .for(vaults)
        .process(async (i) => {
            // Collateral token is NOT the baseToken emitted by VaultRegistered
            // Reading directly from storage
            const collateralToken = await provider.getStorage(i.vault, "0x78");
            return { vault: i.vault, collateral: "0x" + collateralToken.slice(26) };
        });

    if (errors.length) {
        throw errors[0];
    };

    await api.sumTokens({ 
        tokens: poolData.map(i => i.collateral), 
        owners: poolData.map(i => i.vault) 
    });
};

module.exports = {
    methodology: "Value of deposited collateral assets across all vaults.",
    bsc: { tvl },
};