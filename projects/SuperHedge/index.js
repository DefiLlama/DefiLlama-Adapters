const ADDRESSES = require('../helper/coreAssets.json')
const SH_VAULT_1_CURRENCY = ADDRESSES.ethereum.USDe; // USDe Ethereum
const SH_VAULT_1_PT = '0x8A47b431A7D947c6a3ED6E42d501803615a97EAa'; // Pendle pt token
const SH_VAULT_1 = '0xDF59153DA47dc7c39505261D423BAf14c48D23A6'; // SHProduct Vault

const SH_VAULT_2_CURRENCY = '0x7c1156e515aa1a2e851674120074968c905aaf37'; // lvlUSD Ethereum
const SH_VAULT_2_PT = '0x9bca74f805ab0a22ddd0886db0942199a0feba71'; // Pendle pt token
const SH_VAULT_2 = '0xca287B0E1F4d498D3e9C637E611eb37AAA553B2a'; // SHProduct Vault 2

async function tvl(api) {
  
  const currencyBalance1 = await api.call({
    abi: 'erc20:balanceOf',
    target: SH_VAULT_1_CURRENCY,
    params: [SH_VAULT_1],
  });
  api.add(SH_VAULT_1_CURRENCY, currencyBalance1)

  const ptBalance1 = await api.call({
    abi: 'erc20:balanceOf',
    target: SH_VAULT_1_PT,
    params: [SH_VAULT_1],
  });
  api.add(SH_VAULT_1_PT, ptBalance1)

  const currencyBalance2 = await api.call({
    abi: 'erc20:balanceOf',
    target: SH_VAULT_2_CURRENCY,
    params: [SH_VAULT_2],
  });
  api.add(SH_VAULT_2_CURRENCY, currencyBalance2)
  
  const ptBalance2 = await api.call({
    abi: 'erc20:balanceOf',
    target: SH_VAULT_2_PT,
    params: [SH_VAULT_2],
  });
  api.add(SH_VAULT_2_PT, ptBalance2)
}

module.exports = {
  methodology: 'counts the number of stablecoins and pt tokens in the SuperHedge Vault contracts.',
  ethereum: {
    tvl,
  }
};
