const { nibiru } = require('../helper/coreAssets');
const { getBalance2 } = require('../helper/chain/cosmos');

const owners = {
  perp: 'nibi1ntmw2dfvd0qnw5fnwdu9pev2hsnqfdj9ny9n0nzh2a5u8v0scflq930mph',
  vaultUsdc: 'nibi193m2a00pmdsvkcvugrfewqzhtq6k0srkjzvxp2sk357vlpspx5vqxu8d7p',
  saiEvm: '0x25589C8071fa10B7a8c62CdCA7035c539242A774',
  // Bech32 encoding of the same 20-byte SaiEvm proxy address.
  saiEvmBank: 'nibi1y4vfeqr3lggt02xx9nw2wq6u2wfy9fm5gllrzm',
};

async function tvl(api) {
  const denom = `erc20/${nibiru.SAI_USDC}`;
  const key = denom.replaceAll('/', ':');
  const bankBalances = await Promise.all(
    [owners.perp, owners.vaultUsdc, owners.saiEvmBank].map(owner =>
      getBalance2({ chain: api.chain, owner, tokens: [denom] })
    )
  );
  const proxyErc20Balance = await api.call({
    target: nibiru.SAI_USDC,
    abi: 'erc20:balanceOf',
    params: owners.saiEvm,
  });

  // Preserve raw six-decimal units. Failed reads must not become zero TVL.
  for (const amount of [...bankBalances.map(balances => balances[key] ?? '0'), proxyErc20Balance]) {
    if (!/^\d+$/.test(String(amount))) throw new Error('Invalid Sai USDC balance');
    api.add(nibiru.SAI_USDC, amount);
  }
}

module.exports = {
  timetravel: false, // Cosmos balance helpers read latest state, not historical heights.
  methodology: 'Counts canonical Sai USDC held by the Perp contract, active USDC vault, and SaiEvm proxy. SaiEvm includes operator-funded conversion inventory. Bank coins and proxy-owned ERC20 balances are distinct custody; EVM module escrow backing Bank coins is excluded. Legacy USDC.e, retired stNIBI custody, gas reserves, and Base Hub backing are excluded.',
  nibiru: { tvl },
};
