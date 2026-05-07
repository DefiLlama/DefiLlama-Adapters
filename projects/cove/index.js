const basketManager = "0x716c39658Ba56Ce34bdeCDC1426e8768E61912f8";
const basketTokensAbi = "function basketTokens() view returns (address[])";
const basketAssetsAbi = "function basketAssets(address basket) view returns (address[])";
const basketBalanceOfAbi = "function basketBalanceOf(address basket, address asset) view returns (uint256)";

const RECURSIVE_4626_LIST = [
  '0x81f78DeF7a3a8B0F6aABa69925efC69E70239D95', // ysyG-yvUSDS-1
];

// Get the tvl of all baskets deployed by Cove
async function tvl(api) {
  const basketTokens = await api.call({ target: basketManager, abi: basketTokensAbi });
  const basketAssets = await api.multiCall({
    abi: basketAssetsAbi,
    calls: basketTokens.map((token) => ({ target: basketManager, params: [token] })),
  });

  // Create calls for each basket-asset pair
  const calls = [];
  basketTokens.forEach((basketToken, i) => {
    basketAssets[i].forEach((asset) => {
      calls.push({ target: basketManager, params: [basketToken, asset] });
    });
  });

  const basketBalances = await api.multiCall({
    abi: basketBalanceOfAbi,
    calls: calls,
  });

  // Group basket balances by asset
  let callIndex = 0;
  const assetBalances = {};
  basketTokens.forEach((_, i) => {
    basketAssets[i].forEach((asset) => {
      const balance = basketBalances[callIndex];
      if (balance && balance > 0) {
        assetBalances[asset] = (assetBalances[asset] || 0n) + BigInt(balance);
      }
      callIndex++;
    });
  });

  // Add balances and handle special tokens that need recursive unwrapping
  const recursiveTokens = {};
  const directTokens = {};

  for (const [asset, balance] of Object.entries(assetBalances)) {
    if (RECURSIVE_4626_LIST.includes(asset)) {
      recursiveTokens[asset] = balance;
    } else {
      directTokens[asset] = balance;
    }
  }

  // Add direct tokens
  for (const [asset, balance] of Object.entries(directTokens)) {
    api.add(asset, balance);
  }

  // Recursively unwrap nested tokens
  if (Object.keys(recursiveTokens).length > 0) {
    await unwrap4626RecursiveBatch(api, recursiveTokens);
  }
}

// Recursively unwrap ERC-4626 tokens in batches until we reach the underlying assets
async function unwrap4626RecursiveBatch(api, tokensAndBalances, depth = 0) {
  // Prevent infinite recursion
  if (depth > 10 || Object.keys(tokensAndBalances).length === 0) {
    for (const [token, balance] of Object.entries(tokensAndBalances)) {
      api.add(token, balance);
    }
    return;
  }

  const tokens = Object.keys(tokensAndBalances);

  // Batch call to get underlying assets
  const underlyingAssets = await api.multiCall({
    abi: "function asset() view returns (address)",
    calls: tokens,
    permitFailure: true
  });

  // Prepare calls for convertToAssets
  const convertCalls = [];
  const vaultsToUnwrap = {};
  const baseAssets = {};

  tokens.forEach((token, i) => {
    if (underlyingAssets[i]) {
      convertCalls.push({
        target: token,
        params: [tokensAndBalances[token]]
      });
      vaultsToUnwrap[token] = underlyingAssets[i];
    } else {
      // Not a vault, add to base assets
      baseAssets[token] = tokensAndBalances[token];
    }
  });

  // Add base assets
  for (const [token, balance] of Object.entries(baseAssets)) {
    api.add(token, balance);
  }

  if (convertCalls.length === 0) return;

  // Batch call to convert balances
  const underlyingBalances = await api.multiCall({
    abi: "function convertToAssets(uint256) view returns (uint256)",
    calls: convertCalls
  });

  // Prepare next iteration
  const nextTokensAndBalances = {};
  let callIndex = 0;
  for (const [vaultToken, underlyingToken] of Object.entries(vaultsToUnwrap)) {
    const underlyingBalance = underlyingBalances[callIndex++];
    if (nextTokensAndBalances[underlyingToken]) {
      nextTokensAndBalances[underlyingToken] =
        (BigInt(nextTokensAndBalances[underlyingToken]) + BigInt(underlyingBalance)).toString();
    } else {
      nextTokensAndBalances[underlyingToken] = underlyingBalance;
    }
  }

  // Recursive call for next level
  await unwrap4626RecursiveBatch(api, nextTokensAndBalances, depth + 1);
}


module.exports = {
  ethereum: { tvl },
};
