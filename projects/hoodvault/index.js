const { sumTokens2 } = require("../helper/unwrapLPs");

const NFT = "0x9482b1B0D96A3F7ABA14b9C433F7032FEe11d649";

// ---------------------------------------------------------
// Determine which tokens the DefiLlama Coins API already has
// a live price for.
//
// NOTE FOR REVIEWERS: this queries coins.llama.fi directly
// over HTTP, which works fine for local testing but may not
// be the pattern DefiLlama prefers inside an adapter. Happy
// to switch to an existing helper if one is more idiomatic.
// ---------------------------------------------------------

async function getDefiLlamaPricedTokens(tokens, timestamp) {
  const priced = new Set();

  const unique = [...new Set(tokens.map((t) => t.toLowerCase()))];

  const CHUNK_SIZE = 50;

  for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
    const chunk = unique.slice(i, i + CHUNK_SIZE);

    const ids = chunk
      .map((token) => `robinhood:${token}`)
      .join(",");

    try {
      const url = timestamp
        ? `https://coins.llama.fi/prices/historical/${timestamp}/${ids}`
        : `https://coins.llama.fi/prices/current/${ids}`;

      const res = await fetch(url);

      if (!res.ok) continue;

      const data = await res.json();

      for (const token of chunk) {
        const id = `robinhood:${token}`;
        const info = data?.coins?.[id];

        if (
          info &&
          typeof info.price === "number" &&
          Number.isFinite(info.price) &&
          info.price > 0
        ) {
          priced.add(token);
        }
      }
    } catch (e) {
      console.log(
        "HoodVault: DefiLlama price lookup failed:",
        e.message
      );
    }
  }

  return priced;
}

// ---------------------------------------------------------
// TVL
// ---------------------------------------------------------

async function tvl(api) {
  // 1. Enumerate HoodVault NFTs.

  const nextTokenId = await api.call({
    target: NFT,
    abi: "uint256:nextTokenId",
  });

  const tokenIds = [];

  for (let id = 1; id < Number(nextTokenId); id++) {
    tokenIds.push(id);
  }

  if (!tokenIds.length) return {};

  // 2. Resolve ERC-6551 accounts.

  const accounts = await api.multiCall({
    abi: "function accountOf(uint256) view returns (address)",
    calls: tokenIds.map((id) => ({
      target: NFT,
      params: [id],
    })),
  });

  const ZERO =
    "0x0000000000000000000000000000000000000000";

  const liveAccounts = [
    ...new Set(
      accounts
        .filter(Boolean)
        .map((a) => a.toLowerCase())
    ),
  ].filter((a) => a !== ZERO);

  if (!liveAccounts.length) return {};

  // 3. backingAssets() only discovers token addresses.
  // Actual amounts come from current balanceOf().

  const backings = await api.multiCall({
    abi: "function backingAssets() view returns (address[] tokens, uint256[] depositedAmounts)",
    calls: liveAccounts.map((account) => ({
      target: account,
    })),
    permitFailure: true,
  });

  // token -> Set<vault account>

  const holders = {};

  liveAccounts.forEach((account, i) => {
    const backing = backings[i];

    if (!backing) return;

    const [tokens] = backing;

    if (!tokens?.length) return;

    for (const token of tokens) {
      if (!token) continue;

      const key = token.toLowerCase();

      if (key === ZERO) continue;

      (holders[key] ??= new Set()).add(account);
    }
  });

  const tokens = Object.keys(holders);

  if (!tokens.length) return {};

  // 4. Ask Coins API which tokens already have native pricing.
  // A token without a live price here (common right after it
  // launches on this chain) is simply left out of TVL rather
  // than guessed at, so it's picked up automatically once
  // Coins starts pricing it.

  const pricedTokens = await getDefiLlamaPricedTokens(
    tokens,
    api.timestamp
  );

  const ownerTokens = [];

  for (const token of tokens) {
    if (!pricedTokens.has(token)) continue;

    for (const account of holders[token]) {
      ownerTokens.push([[token], account]);
    }
  }

  if (ownerTokens.length) {
    await sumTokens2({
      api,
      ownerTokens,
    });
  }

  return api.getBalances();
}

module.exports = {
  methodology:
    "Sums the current ERC20 balances held by every HoodVault ERC-6551 vault account. Vaults are enumerated on-chain via HoodVault.nextTokenId/accountOf. backingAssets() is used only to discover which token addresses a vault ever held, not the amounts it reports, since that bookkeeping is not cleared on redemption. TVL is computed from each token's live balanceOf instead, so a redeemed vault correctly reads zero. Only tokens the DefiLlama Coins API already prices are counted; a token without a live price there yet is left out of TVL until Coins picks it up.",

  robinhood: {
    tvl,
  },
};
