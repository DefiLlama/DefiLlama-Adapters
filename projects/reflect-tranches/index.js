const { getConnection, getMultipleAccounts, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const RLP_PROGRAM = new PublicKey("JrXLmS6aYJNJDVxdAfjNJE5wikT8ubf3TA9iL2JA9Av");
const PROXY_PROGRAM = new PublicKey("pRoxYU64BSjv8HbhENna8a7LVCrkzzNrnvbYuTwas8C");
const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ATA_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

const RLP_ASSET_DISC = Buffer.from([234, 180, 241, 252, 139, 224, 160, 8]);
const RLP_POOL_DISC = Buffer.from([66, 38, 17, 64, 188, 80, 68, 129]);
const PROXY_STATE_SIZE = 156;

const ataFor = (mint, owner) => PublicKey.findProgramAddressSync([owner.toBuffer(), TOKEN_PROGRAM.toBuffer(), mint.toBuffer()], ATA_PROGRAM)[0];

async function tvl(api) {
  const connection = getConnection();
  const rlpAccounts = await connection.getProgramAccounts(RLP_PROGRAM);

  // RLP Asset registry: disc(8) bump(8) index(9) mint[10..42]. index -> underlying mint.
  const assetMintByIndex = {};
  const rawPools = [];
  for (const { pubkey, account: { data } } of rlpAccounts) {
    if (data.slice(0, 8).equals(RLP_ASSET_DISC)) assetMintByIndex[data[9]] = new PublicKey(data.slice(10, 42));
    else if (data.slice(0, 8).equals(RLP_POOL_DISC)) rawPools.push({ pubkey, data });
  }

  // filtered by protected_vault to remove test vaults 
  const pools = rawPools.map(({ pubkey, data }) => {
    let o = 58;
    if (data[o++] === 1) o += 8;
    const assetCount = data[o++];
    const assetIdxs = [...data.slice(o, o + 4)]; o += 4;
    const protectedVault = data[o++] === 1 ? new PublicKey(data.slice(o, o + 32)) : null;
    return { pubkey, assetCount, assetIdxs, protectedVault };
  }).filter((p) => p.protectedVault);

  const proxies = await getMultipleAccounts(pools.map((p) => p.protectedVault));

  const tokenAccounts = [];
  pools.forEach((pool, i) => {
    const proxy = proxies[i];
    if (!proxy || !proxy.owner.equals(PROXY_PROGRAM) || proxy.data.length !== PROXY_STATE_SIZE) return;
    // Junior: the pool PDA's ATA for each underlying asset it holds
    for (let j = 0; j < pool.assetCount; j++) {
      const mint = assetMintByIndex[pool.assetIdxs[j]];
      if (mint) tokenAccounts.push(ataFor(mint, pool.pubkey).toString());
    }
    // Senior: the backstopped proxy holds its underlying
    const stablecoinMint = new PublicKey(proxy.data.slice(32, 64));
    tokenAccounts.push(ataFor(stablecoinMint, pool.protectedVault).toString());
  });

  return sumTokens2({ api, tokenAccounts });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Reflect Tranches TVL is the underlying tokens held by the live tranche pools on the RLP program (JrXLmS6aYJNJDVxdAfjNJE5wikT8ubf3TA9iL2JA9Av). A pool is live when its protected_vault resolves to a real Reflect Proxy Program (pRoxYU64BSjv8HbhENna8a7LVCrkzzNrnvbYuTwas8C) ProxyState, which excludes placeholder pools. Junior = the underlying assets held in each RLP pool's per-asset token accounts. Senior = the underlying held by the backstopped proxy vault. Those same deposits are also counted by the underlying yield sources, so TVL is marked doublecounted.",
  solana: { tvl },
};
