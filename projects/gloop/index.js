const LENDING_POOL_ADDRESS = "0x9BE2e5739B1a6A175d36Ce043f44E66965a433EB";
const GMI_TOKEN_ADDRESS = "0xAad4187a81689AF72d91966c8119756E425cD7CF";

// Token addresses on Arbitrum
const GM_BTC_ADDRESS = "0x47c031236e19d024b42f8AE6780E44A573170703";
const GM_ETH_ADDRESS = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336";
const GM_SOL_ADDRESS = "0x09400D9DB990D5ed3f35D7be61DfAEB900Af03C9";
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// ABIs
const GMI_ABI = require("./GMI.json");
const LENDING_POOL_ABI = require("./LendingPool.json");

async function tvl(api) {
    // Get GM Lending TVL by calling totalUnderlying for each supported token
    const supportedTokens = [
        GM_BTC_ADDRESS,
        GM_ETH_ADDRESS,
        GM_SOL_ADDRESS,
        USDC_ADDRESS,
    ];

    const underlyingBalances = await api.multiCall({
        abi: LENDING_POOL_ABI.abi.find((f) => f.name === "totalUnderlying"),
        calls: supportedTokens.map((token) => ({
            target: LENDING_POOL_ADDRESS,
            params: [token],
        })),
    });

    // Add underlying token balances from lending pools
    supportedTokens.forEach((token, i) => {
        api.add(token, underlyingBalances[i]);
    });

    // Get GMI TVL by querying the vault system
    // The GMI contract uses a vault system - try to get vault balances
    try {
        // Try getting treasury vaults length by checking if index 0, 1, 2, 3 exist
        const maxVaults = 10; // Reasonable upper limit
        const vaultNames = [];

        for (let i = 0; i < maxVaults; i++) {
            try {
                const vaultName = await api.call({
                    abi: "function treasuryVaults(uint256) view returns (bytes32)",
                    target: GMI_TOKEN_ADDRESS,
                    params: [i],
                });
                if (
                    vaultName &&
                    vaultName !==
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                ) {
                    vaultNames.push(vaultName);
                }
            } catch (e) {
                // No more vaults
                break;
            }
        }

        // For each vault, get its token and balance
        for (const vaultName of vaultNames) {
            try {
                // Get vault info to find out what token it holds
                const vaultInfo = await api.call({
                    abi: GMI_ABI.abi.find((f) => f.name === "vaults"),
                    target: GMI_TOKEN_ADDRESS,
                    params: [vaultName],
                });

                const [bank, token, weight, oracle, active] = vaultInfo;

                if (
                    active &&
                    token &&
                    token !== "0x0000000000000000000000000000000000000000"
                ) {
                    // Get the balance in this vault
                    const vaultBalance = await api.call({
                        abi: GMI_ABI.abi.find((f) => f.name === "bankBalance"),
                        target: GMI_TOKEN_ADDRESS,
                        params: [vaultName],
                    });

                    if (vaultBalance > 0n) {
                        api.add(token, vaultBalance);
                    }
                }
            } catch (e) {
                console.log(
                    `Error getting vault info for ${vaultName}:`,
                    e.message
                );
            }
        }
    } catch (e) {
        console.log(
            "Error getting GMI vault balances, falling back to direct token balances:",
            e.message
        );

        // Fallback: check direct token balances
        const gmTokensInGMI = [
            GM_BTC_ADDRESS,
            GM_ETH_ADDRESS,
            GM_SOL_ADDRESS,
            USDC_ADDRESS,
        ];

        const gmiTokenBalances = await api.multiCall({
            abi: "erc20:balanceOf",
            calls: gmTokensInGMI.map((token) => ({
                target: token,
                params: [GMI_TOKEN_ADDRESS],
            })),
        });

        gmTokensInGMI.forEach((token, i) => {
            if (gmiTokenBalances[i] > 0n) {
                api.add(token, gmiTokenBalances[i]);
            }
        });
    }
}

module.exports = {
    methodology:
        "Gloop TVL consists of two parts: (1) GMI Index TVL from totalControlledValue() which tracks GM tokens in the index, and (2) GM Lending TVL from totalUnderlying() for each supported token (GM BTC, GM ETH, GM SOL, USDC) in the lending pools.",
    // A little after Lending Pool contract was deployed
    start: 1744340400,
    arbitrum: {
        tvl,
    },
};

