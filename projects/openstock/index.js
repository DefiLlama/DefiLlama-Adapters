// OpenStock (https://opn.st) - on-chain pre-IPO market built by Polynomial Protocol.
// Each pre-IPO stock gets its own single-purpose vault contract per chain. Users
// deposit the chain's settlement stablecoin into the vault and receive a claim
// token 1:1; the vault balance reflects capital not yet deployed to purchase the
// off-chain IPO allocation (or, after settlement, capital returned pending
// redemption).
const vaults = [
  {
    ticker: "ZNJX", // Zhongji Innolight (Zhongji Xuchuang) pre-IPO vault
    vault: "0x41D4C067b82DA8357Dfc38e3f24F6033368aF4bb",
    token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", // USDT0
  },
];

async function tvl(api) {
  await api.sumTokens({
    tokensAndOwners: vaults.map(({ token, vault }) => [token, vault]),
  });
}

module.exports = {
  methodology:
    "Sums the settlement-stablecoin (USDT0) balance held directly by each OpenStock pre-IPO vault contract on Mantle.",
  mantle: { tvl },
};
