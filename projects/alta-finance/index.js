const sdk = require("@defillama/sdk");

const investDebtContracts = {
    polygon: ["0xE92F580C930dd24aACB38Ab0EA18F6c1dEf31369"]
};

const investEquityContracts = {
    polygon: ["0xcf152E9f60E197A44FAdce961c6B822Dcb6c9dcc"]
};

async function calculateTvl(chain, fundsMap, type) {
    let tvl_ = [];
    for (let i = 0; i < fundsMap.length; i++) {
        try {
            const response = await sdk.api.abi.call({
                abi: type === 'debt' ? 'uint256:amount' : 'uint256:_tokenIdCounter',
                target: fundsMap[i],
                chain
            });
            if (!response.output) {
                console.error(`Failed to fetch data for ${type} contract: ${fundsMap[i]}`);
                continue; // Skip this contract and continue with the next one
            }
            const amount = Number(response.output);
            if (amount === 0) {
                tvl_.push(0);
            } else {
                const amountPerNft = await sdk.api.abi.call({
                    abi: 'uint256:amountPerNft',
                    target: fundsMap[i],
                    chain
                });
                const totalVolume = type === 'debt' ? amount / 10 ** 6 : amount * Number(amountPerNft.output) / 10 ** 6;
                tvl_.push(totalVolume);
            }
        } catch (error) {
            console.error(`Error fetching data for ${type} contract: ${fundsMap[i]}`, error);
        }
    }
    return tvl_.reduce((pv, cv) => pv + cv, 0);
}

async function generateExports() {
    const exports = {
        methodology: "Sums the amount of funded real-world assets on ALTA Finance."
    };

    // Collect all promises for debt contracts
    await Promise.all(Object.keys(investDebtContracts).map(async (chain) => {
        const tvl = await calculateTvl(chain, investDebtContracts[chain], 'debt');
        exports[chain] = { tvl };
    }));

    // Collect all promises for equity contracts
    await Promise.all(Object.keys(investEquityContracts).map(async (chain) => {
        const tvl = await calculateTvl(chain, investEquityContracts[chain], 'equity');
        if (exports[chain]) {
            exports[chain].tvl += tvl;
        } else {
            exports[chain] = { tvl };
        }
    }));

    // Calculate total TVL and assign to main object
    let total_ = []
    await Promise.all(
        Object.keys(exports).map(async (chain) => {
            if(exports[chain]?.tvl > 0) {
                total_.push(exports[chain].tvl)
            }
            return
        })
    );
    exports.tvl = total_.reduce((pv, cv) => pv + cv, 0);

    module.exports = exports;
}

generateExports();
