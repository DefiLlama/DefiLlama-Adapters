
async function tvlBase(api) {
    // gtUSDCa vault
    const vault = '0x000000000001CdB57E58Fa75Fe420a0f4D6640D5';
    return tvl(api, vault);
}

async function tvl(api, vault) {
    const block = await api.getBlock();
    const totalSupply = await api.call({
        abi: 'function totalSupply() view returns (uint256)',
        target: vault,
        block,
    });

    const feeCalculator = await api.call({
        abi: 'function feeCalculator() view returns (address)',
        target: vault,
        block,
    });

    const numeraireToken = await api.call({
        abi: 'function NUMERAIRE() view returns (address)',
        target: feeCalculator,
        block,
    });

    const vaultState = await api.call({
        abi: 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))',
        target: feeCalculator,
        params: [vault],
        block,
    });
    const unitPrice = vaultState[8];
    const numeraireBlance = totalSupply * unitPrice / 1e18;

    api.add(numeraireToken, numeraireBlance);
}

module.exports = {
  methodology: 'Counts tokens held directly in vaults, as well as all managed DeFi positions.',
  start: 1748414859,
  base: { tvl: tvlBase },
};
