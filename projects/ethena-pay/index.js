const ADDRESSES = require('../helper/coreAssets.json');
const { getAddress, getLogs2 } = require('../helper/cache/getLogs');
const { sumTokensLowValue } = require('../helper/cache/lowValue');

// Ethena Pay (https://pay.ethena.fi) gives each card user an account on Avalanche C-Chain: a beacon proxy
// (beacon 0xc831ea25deb7654679a438c78c4c5d1c313c8448, owned by the registry). The registry creates them; both of its
// creation events carry the new account in topics[2].
const REGISTRY = '0xAc66ca9A79fb0D3C64cBa44cd29610CD58602D6f';
const ACCOUNT_CREATED_TOPICS = [
  '0x26894cd0aa4e77862bb98a9a46a9ff691846b052f0695e107d3cab1788865184',
  '0x4c35b713f0d2330199e6e15fa5381c737a9c83f5bc0c9eeb4804a2d71d585d3c',
];
const FROM_BLOCK = 87687233; // the registry's first creation event, 2026-06-10

const USDE = ADDRESSES.avax.USDe;
// Ethena Pay Earn: an Upshift vault that takes USDe and mints pUSDe to the account; shares waiting to be redeemed sit
// in the vault. getSharePrice() gives USDe per pUSDe (18 decimals).
const PUSDE = '0xcb5c7b865da0867769c1263dc80088d93fd3fb79';
const EARN_VAULT = '0x6aab14c53980b9aa1ce632a7e46a6e5e62e60f55';
// the vault and pUSDe were deployed together in tx 0xc951045d... at block 93,588,064 (2026-08-24); before it there is no pUSDe
const EARN_START_BLOCK = 93588064;

async function getAccounts(api) {
  const accounts = [];
  for (const topic of ACCOUNT_CREATED_TOPICS) {
    const logs = await getLogs2({ api, target: REGISTRY, topics: [topic], fromBlock: FROM_BLOCK, extraKey: `ethena-pay-${topic.slice(0, 10)}` });
    logs.forEach(log => accounts.push(getAddress(log.topics[2])));
  }
  return [...new Set(accounts)];
}

async function tvl(api) {
  const accounts = await getAccounts(api);
  // what the accounts hold: USDe for card spending, plus AVAX (cashback), USDC and USDT
  const tokens = [USDE, ADDRESSES.null, ADDRESSES.avax.USDC, ADDRESSES.avax.USDt];
  // pUSDe held by the accounts or queued in the vault, valued in USDe at the vault's share price: together that is the
  // whole Earn vault. The vault's own USDe is part of what backs pUSDe, so it is not added again. Queued pUSDe is valued at
  // today's share price too, on purpose: it stays in the vault's assets until it is redeemed.
  const block = await api.getBlock();
  const earnLive = block >= EARN_START_BLOCK;
  let sharePrice = 0n;
  if (earnLive) {
    tokens.push(PUSDE);
    sharePrice = BigInt(await api.call({ abi: 'uint256:getSharePrice', target: EARN_VAULT }));
    const queued = await api.call({ abi: 'erc20:balanceOf', target: PUSDE, params: EARN_VAULT });
    api.add(USDE, (BigInt(queued) * sharePrice / 10n ** 18n).toString());
  }
  const usde = USDE.toLowerCase();
  const toUSDe = ({ [PUSDE]: shares, ...balances }) => {
    if (shares !== undefined) balances[usde] = (BigInt(balances[usde] ?? 0) + BigInt(shares) * sharePrice / 10n ** 18n).toString();
    return balances;
  };
  // There are tens of thousands of accounts and most hold next to nothing: an account worth under $100 is stored with
  // its balances, counted from the store, and read again once a week.
  await sumTokensLowValue({ api, project: 'ethena-pay', owners: accounts, tokens, transform: toUSDe, freshCount: 2000 });
}

module.exports = {
  // USDe is Ethena's own token, already in Ethena's TVL; the Earn vault is already counted by Upshift's listing
  doublecounted: true,
  methodology: "Tokens held by Ethena Pay accounts (created by the Ethena Pay registry on Avalanche): USDe, AVAX, USDC and USDT, plus pUSDe (Ethena Pay Earn) held by those accounts or queued in the Earn vault, valued in USDe at the vault's share price. Marked double counted: USDe is in Ethena's TVL and the Earn vault in Upshift's.",
  avax: { tvl },
};
