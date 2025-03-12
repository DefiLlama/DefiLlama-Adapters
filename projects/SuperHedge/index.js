const SH_VAULT_1_CURRENCY = '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3'; // USDe Ethereum
const SH_VAULT_1_PT = '0x8A47b431A7D947c6a3ED6E42d501803615a97EAa'; // Pendle pt token
const SH_VAULT_1 = '0xDF59153DA47dc7c39505261D423BAf14c48D23A6'; // SHProduct Vault

async function tvl(api) {
  
  const currencyBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: SH_VAULT_1_CURRENCY,
    params: [SH_VAULT_1],
  });

  api.add(SH_VAULT_1_CURRENCY, currencyBalance)

  const ptBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: SH_VAULT_1_PT,
    params: [SH_VAULT_1],
  });

  api.add(SH_VAULT_1_PT, ptBalance)
}

module.exports = {
  methodology: 'counts the number of stablecoins and pt tokens in the SuperHedge Vault contract.',
  ethereum: {
    tvl,
  }
};
