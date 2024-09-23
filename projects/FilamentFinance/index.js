const USDC_CONTRACT = '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1';
const FILAMENT_VAULT_CONTRACT = '0xbeB6A6273c073815eBe288d2dF4e5E8bc027DA11';

async function tvl(api) {
  const usdcBalanceInFilamentVault = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_CONTRACT,
    params: [FILAMENT_VAULT_CONTRACT],
  });

  api.add(USDC_CONTRACT, usdcBalanceInFilamentVault)
}

module.exports = {
  methodology: 'Get the current USDC balance available in the pool.',
  start: 100601155,
  sei: {
    tvl
  }
};