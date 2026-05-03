/**
 * DefiLlama SDK adapter — Zama confidential (ERC-7984) wrappers on Ethereum.
 *
 * TVS (Total Value Shielded): for every valid (underlying, wrapper) pair in the
 * official Wrappers Registry, we count wrapper.totalSupply() as the amount of
 * underlying notionally shielded, normalized to the underlying token's decimals.
 *
 * Project path: projects/zama-protocol-tvs/
 * Registry: https://docs.zama.org/protocol/protocol-apps/addresses/mainnet/ethereum.md
 */

const REGISTRY = '0xeb5015fF021DB115aCe010f23F55C2591059bBA0';

const registryGetPairsAbi =
  'function getTokenConfidentialTokenPairs() view returns (tuple(address tokenAddress, address confidentialTokenAddress, bool isValid)[])';

/**
 * Coerce a multicall return value to BigInt.
 * @param {bigint|number|string} v
 * @returns {bigint}
 */
function toBigInt(v) {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(Math.trunc(v));
  return BigInt(String(v));
}

/**
 * Convert wrapper totalSupply (wrapper decimals) to underlying raw units.
 * @param {bigint} supply
 * @param {bigint} wrapperDecimals
 * @param {bigint} underlyingDecimals
 * @returns {bigint}
 */
function toUnderlyingRawAmount(supply, wrapperDecimals, underlyingDecimals) {
  const w = BigInt(wrapperDecimals);
  const u = BigInt(underlyingDecimals);
  if (w === u) return supply;
  return (supply * 10n ** u) / 10n ** w;
}

/**
 * Sum TVS: for each valid registry pair, add underlying amount implied by wrapper totalSupply.
 * Fail-fast if any registry-listed pair cannot be read (no silent understatement of TVL).
 * @param {import('@defillama/sdk').ChainApi} api
 */
async function tvl(api) {
  const pairs = await api.call({
    target: REGISTRY,
    abi: registryGetPairsAbi,
  });

  if (!pairs || !pairs.length) return;

  const valid = pairs.filter((p) => {
    const ok = Array.isArray(p) ? p[2] : p.isValid;
    return ok;
  });

  if (!valid.length) return;

  const wrappers = valid.map((p) => (Array.isArray(p) ? p[1] : p.confidentialTokenAddress));
  const underlyings = valid.map((p) => (Array.isArray(p) ? p[0] : p.tokenAddress));

  const totalSupplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: wrappers.map((target) => ({ target })),
  });

  const wrapperDecimals = await api.multiCall({
    abi: 'erc20:decimals',
    calls: wrappers.map((target) => ({ target })),
  });

  const underlyingDecimals = await api.multiCall({
    abi: 'erc20:decimals',
    calls: underlyings.map((target) => ({ target })),
  });

  for (let i = 0; i < valid.length; i++) {
    if (totalSupplies[i] == null || wrapperDecimals[i] == null || underlyingDecimals[i] == null) {
      throw new Error(
        `zama-protocol-tvs: missing multicall result for valid registry pair index=${i} underlying=${underlyings[i]} wrapper=${wrappers[i]}`,
      );
    }
    const supply = toBigInt(totalSupplies[i]);
    if (supply === 0n) continue;

    const wDec = toBigInt(wrapperDecimals[i]);
    const uDec = toBigInt(underlyingDecimals[i]);
    const raw = toUnderlyingRawAmount(supply, wDec, uDec);
    if (raw === 0n) continue;

    api.add(underlyings[i], raw);
  }
}

module.exports = {
  methodology:
    'Total value shielded (TVS): sums underlying ERC-20 amounts represented by confidential wrapper totalSupply for each valid pair returned by the Zama Wrappers Registry on Ethereum. Balances are priced by DefiLlama as TVL.',
  timetravel: true,
  misrepresentedTokens: false,
  ethereum: {
    tvl,
  },
};
