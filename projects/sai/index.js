const { nibiru } = require('../helper/coreAssets');

const saiEvm = '0x25589C8071fa10B7a8c62CdCA7035c539242A774';
const wasm = '0x0000000000000000000000000000000000000802';
const funtoken = '0x0000000000000000000000000000000000000800';

async function tvl(api) {
  const perp = await api.call({
    target: saiEvm,
    abi: 'function perpContractAddress() view returns (string)',
  });
  const [reservesBytes, proxyBank, proxyErc20] = await Promise.all([
    api.call({
      target: wasm,
      abi: 'function query(string contractAddr, bytes req) view returns (bytes)',
      params: [perp, `0x${Buffer.from('{"get_sai_reserves":{}}').toString('hex')}`],
    }),
    api.call({
      target: funtoken,
      abi: 'function bankBalance(address who, string bankDenom) view returns (uint256 bankBalance, (address ethAddr, string bech32Addr) whoAddrs)',
      params: [saiEvm, `erc20/${nibiru.SAI_USDC}`],
    }),
    api.call({
      target: nibiru.SAI_USDC,
      abi: 'function balanceOf(address account) view returns (uint256)',
      params: [saiEvm],
    }),
  ]);
  const reserves = JSON.parse(Buffer.from(reservesBytes.slice(2), 'hex').toString('utf8'));
  if (reserves.usdc_denom !== `erc20/${nibiru.SAI_USDC}` ||
      !Array.isArray(reserves.issues) || reserves.issues.length || !Array.isArray(reserves.vaults))
    throw new Error('Incomplete or noncanonical Sai USDC reserves');

  // The Wasm query discovers configured USDC vaults and reads actual Bank custody.
  // Reject duplicate owners rather than counting a configured balance twice.
  const owners = new Set([perp, proxyBank[1][1]]);
  for (const vault of reserves.vaults) {
    if (typeof vault.slp_addr !== 'string' || !vault.slp_addr || owners.has(vault.slp_addr))
      throw new Error('Invalid or duplicate Sai vault owner');
    owners.add(vault.slp_addr);
  }
  const amounts = [reserves.perp_bank_balance, ...reserves.vaults.map(vault => vault.bank_balance), proxyBank[0], proxyErc20];
  if (amounts.some(amount => !/^\d+$/.test(String(amount))))
    throw new Error('Invalid Sai USDC balance');
  for (const amount of amounts) api.add(nibiru.SAI_USDC, amount);
}

module.exports = {
  methodology: 'Counts canonical Sai USDC held by Perp, its configured USDC vaults, and SaiEvm. All reads use EVM calls, including the Wasm reserves query and FunToken Bank precompile. SaiEvm includes operator-funded conversion inventory. EVM module escrow, Base Hub backing, legacy USDC.e, stNIBI, and gas reserves are excluded.',
  nibiru: { tvl },
};
