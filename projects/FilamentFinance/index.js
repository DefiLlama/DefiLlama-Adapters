const USDC_CONTRACT = '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1';
const FILAMENT_VAULT_CONTRACT = '0xbeB6A6273c073815eBe288d2dF4e5E8bc027DA11';

async function tvl(api) {
    const tvlUSDC = await api.call({ abi: 'uint256:getUsdBalance', target: FILAMENT_VAULT_CONTRACT });
    const totalBorrowedUsd = await api.call({ abi: 'uint256:totalBorrowedUSD', target: FILAMENT_VAULT_CONTRACT });
    
    // Divide the values by 10^12 to get the correct decimal representation
    const tvlUSDCInDecimals = tvlUSDC / (10 ** 12);
    const totalBorrowedUsdInDecimals = totalBorrowedUsd / (10 ** 12);
    const tvl = tvlUSDCInDecimals + totalBorrowedUsdInDecimals;
    api.add(USDC_CONTRACT, tvl);

}

module.exports = {
    methodology: "TVL is calculated as the sum of the available COMB pool balance in the vault and the total USDC borrowed by users from the pool for leverage trading.",
    sei:{
        tvl,
    },
}
