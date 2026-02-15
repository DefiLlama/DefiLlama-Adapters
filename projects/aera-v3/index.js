const { getMultiDepositorVaults, getSingleDepositorVaults } = require('./utils');

async function tvl(api) {
    const multiDepositorVaults = await getMultiDepositorVaults(api);
    const singleDepositorVaults = await getSingleDepositorVaults(api);

    // Compute TVL for multi depositor vaults
    await Promise.all(multiDepositorVaults.map(async (vault) => {
        const [totalSupply, feeCalculator, decimals ] = await Promise.all([
            api.call({
                abi: 'function totalSupply() view returns (uint256)',
                target: vault,
            }),
            api.call({
                abi: 'function feeCalculator() view returns (address)',
                target: vault,
            }),
            api.call({
                abi: 'function decimals() view returns (uint8)',
                target: vault,
            }),
        ])

        const [numeraireToken, vaultState] = await Promise.all([
            api.call({
                abi: 'function NUMERAIRE() view returns (address)',
                target: feeCalculator,
            }),
            api.call({
                abi: 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))',
                target: feeCalculator,
                params: [vault],
            }),
        ])

        const unitPrice = vaultState[8];
        const numeraireBalance = totalSupply * unitPrice / 10 ** decimals;

        api.add(numeraireToken, numeraireBalance);
    }));

    // Compute TVL for single depositor vaults
    await Promise.all(singleDepositorVaults.map(async ({ vault, feeCalculator }) => {
        const numeraireToken = await api.call({
            abi: 'function NUMERAIRE() view returns (address)',
            target: feeCalculator,
        });

        try {
            const value = await api.call({
                abi: 'function value() view returns (uint256)',
                target: vault,
            });
            api.add(numeraireToken, value);
        } catch (e) {
            // Fallback: use getVaultState if value() fails
            try {
                const [vaultState, decimals] = await Promise.all([
                    api.call({
                        abi: 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))',
                        target: feeCalculator,
                        params: [vault],
                    }),
                    api.call({
                        abi: 'function decimals() view returns (uint8)',
                        target: vault,
                    }).catch(() => 18) // Default to 18 if decimals() fails
                ]);

                const unitPrice = vaultState.unitPrice;
                const lastTotalSupply = vaultState.lastTotalSupply;
                const numeraireBalance = lastTotalSupply * unitPrice / 10 ** decimals;

                api.add(numeraireToken, numeraireBalance);
            } catch (e2) {
                console.log(`Failed to get TVL for single depositor vault ${vault}`);
            }
        }
    }));
}

module.exports = {
  methodology: 'Counts tokens held directly in Aera vaults, as well as all managed DeFi positions.',
  start: 1748414859,
  base: { tvl },
  ethereum: { tvl },
};
