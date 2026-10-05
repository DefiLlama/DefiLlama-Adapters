const { sumTokens2 } = require('./unwrapLPs');

/**
 * Extracts the function name from an ABI string.
 *
 * @param {string} abi
 * @returns {string} Function name
 */
function getFnName(abi) {
  if (!abi) return '';
  if (typeof abi === 'object') {
    if (abi.name) return String(abi.name).trim();
    if (Array.isArray(abi) && abi[0]?.name) return String(abi[0].name).trim();
    return '';
  }
  if (typeof abi !== 'string') return '';
  return (abi.includes('(') ? abi.split('(')[0].replace(/.*function\s+/, '') : abi.split(':').pop()).trim();
}

/**
 * Normalizes an ABI identifier, applying standard defaults and type prefixes.
 *
 * @param {string|object} abi - User-provided ABI
 * @param {string} defaultName - Fallback getter name (e.g. 'asset' or 'totalAssets')
 * @param {string} returnType - Return type prefix (e.g. 'address' or 'uint256')
 * @returns {string|object} Normalized ABI
 */
function normalizeAbi(abi, defaultName, returnType) {
  const name = abi || defaultName;
  if (typeof name === 'string' && !name.includes(':') && !name.includes('(')) {
    return `${returnType}:${name}`;
  }
  return name;
}

/**
 * Resolves detached share token addresses for vaults where shares are not
 * minted by the vault contract itself. Tries EIP-7540 `share()`, then `vaultToken()`.
 *
 * @param {ChainApi} api
 * @param {Array<string|object>} targets - Vault addresses to query
 * @returns {Promise<Array<string|null>>} Array of share token addresses
 */
async function resolveShareTokens(api, targets) {
  const shareTokens = await api.multiCall({ calls: targets, abi: 'address:share', permitFailure: true });
  const missingTargets = targets.filter((_, i) => !shareTokens[i]);

  if (!missingTargets.length) return shareTokens;

  const vtTokens = await api.multiCall({ calls: missingTargets, abi: 'address:vaultToken', permitFailure: true });
  let vtIdx = 0;
  return shareTokens.map(token => token || vtTokens[vtIdx++]);
}

/**
 * Fetches share supplies for all vault calls. If a vault reports zero or missing supply,
 * queries detached share tokens (EIP-7540 share() or vaultToken()).
 *
 * @param {ChainApi} api
 * @param {Array<string|object>} calls
 * @returns {Promise<Array<string|null>>} Array of share supply values
 */
async function getVaultSupplies(api, calls) {
  const supplies = await api.multiCall({ calls, abi: 'uint256:totalSupply', permitFailure: true });
  const missingIndices = calls
    .map((_, i) => (!supplies?.[i] || supplies[i] === '0' ? i : -1))
    .filter(i => i !== -1);

  if (!missingIndices.length) return supplies;

  const missingCalls = missingIndices.map(i => calls[i]);
  const shareTokens = await resolveShareTokens(api, missingCalls);
  const validTokens = shareTokens.filter(Boolean);

  if (!validTokens.length) return supplies;

  const externalSupplies = await api.multiCall({ calls: validTokens, abi: 'uint256:totalSupply', permitFailure: true });
  let extIdx = 0;
  missingIndices.forEach((callIdx, i) => {
    if (shareTokens[i]) {
      const extSupply = externalSupplies[extIdx++];
      if (extSupply) {
        supplies[callIdx] = extSupply;
      }
    }
  });

  return supplies;
}

/**
 * Fetches physical underlying token balances held directly by the vault contracts.
 *
 * @param {ChainApi} api
 * @param {Array<string|object>} calls
 * @param {Array<string|null>} tokens
 * @returns {Promise<Array<string|null>>} Array of physical balances
 */
async function getPhysicalBalances(api, calls, tokens) {
  const physCalls = calls.map((call, idx) => {
    const token = tokens[idx];
    if (!token) return null;
    const target = typeof call === 'string' ? call : (call?.target || call);
    return { target: token, params: [target] };
  });

  const validCalls = physCalls.filter(Boolean);
  if (!validCalls.length) return calls.map(() => null);

  const rawBalances = await api.multiCall({ calls: validCalls, abi: 'erc20:balanceOf', permitFailure: true });
  let rawIdx = 0;
  return physCalls.map(c => (c ? rawBalances[rawIdx++] : null));
}

/**
 * Validates and clamps a vault balance against ERC-4626 share invariants and physical backing.
 *
 * @param {object} params
 * @param {string|null} params.token - Underlying token address
 * @param {string|null} params.reported - Reported balance from contract getter
 * @param {string|null} params.supply - Share token totalSupply
 * @param {string|null} params.physical - Physical token balance in the contract
 * @param {boolean} params.is4626 - Whether the balance ABI is standard totalAssets
 * @param {boolean} params.permitUnbacked - Whether unbacked balances are explicitly allowed
 * @returns {string|null} Validated balance to add, or null if rejected
 */
function validateVaultBalance({ token, reported, supply, physical, is4626, permitUnbacked }) {
  if (!token || reported === null || reported === undefined) return null;

  const hasShares = Boolean(supply && supply !== '0');

  // Standard ERC-4626 vaults require minted shares
  if (is4626 && !hasShares) return null;

  // Custom balance getters or un-tokenized contracts must be physically backed (unless explicitly permitted)
  if ((!is4626 || !hasShares) && !permitUnbacked) {
    if (!physical || physical === '0') return null;
    try {
      return BigInt(reported) > BigInt(physical) ? physical : reported;
    } catch {
      return null;
    }
  }

  return reported;
}

/**
 * Sums ERC-4626 vaults, enforcing share invariants (totalSupply > 0)
 * and physical token backing for un-tokenized contracts.
 *
 * @param {object} options
 * @param {ChainApi} options.api - DefiLlama ChainApi instance
 * @param {Array<string|object>} options.calls - Vault addresses or call objects
 * @param {string|object} [options.tokenAbi] - Token getter ABI (default: 'asset' or 'token')
 * @param {string|object} [options.balanceAbi] - Balance getter ABI (default: 'totalAssets' or 'balance')
 * @param {Array<string|object>} [options.balanceCalls] - Custom calls for balance queries
 * @param {boolean} [options.permitFailure=false] - Whether to permit individual RPC call failures
 * @param {boolean} [options.isOG4626=false] - Whether standard ERC-4626 defaults should be used
 * @param {boolean} [options.permitUnbacked=false] - Whether unbacked balances are explicitly allowed
 * @returns {Promise<object>} Current balances map from api
 */
async function sumERC4626Vaults({
  api,
  calls,
  tokenAbi,
  balanceAbi,
  balanceCalls,
  permitFailure = false,
  isOG4626 = false,
  permitUnbacked = false,
}) {
  if (!calls || !calls.length) return api.getBalances();

  tokenAbi = normalizeAbi(tokenAbi, isOG4626 ? 'asset' : 'token', 'address');
  balanceAbi = normalizeAbi(balanceAbi, isOG4626 ? 'totalAssets' : 'balance', 'uint256');
  const is4626 = getFnName(balanceAbi) === 'totalAssets';

  const tokens = await api.multiCall({ calls, abi: tokenAbi, permitFailure });
  const balances = await api.multiCall({ calls: balanceCalls ?? calls, abi: balanceAbi, permitFailure });
  const supplies = await getVaultSupplies(api, calls);

  // Fetch physical balances if permitUnbacked is false and any vault is non-4626 or lacks shares
  const needsPhysical =
    !permitUnbacked &&
    (!is4626 || calls.some((_, i) => !supplies?.[i] || supplies[i] === '0'));
  const physBals = needsPhysical ? await getPhysicalBalances(api, calls, tokens) : null;

  calls.forEach((_, idx) => {
    const validated = validateVaultBalance({
      token: tokens[idx],
      reported: balances[idx],
      supply: supplies?.[idx],
      physical: physBals?.[idx],
      is4626,
      permitUnbacked,
    });

    if (validated) {
      api.addToken(tokens[idx], validated);
    }
  });

  return api.getBalances();
}

function sumERC4626VaultsExport({ vaults, ...options }) {
  return async (api) => {
    await sumERC4626Vaults({ ...options, api, calls: vaults });
    return sumTokens2({ api });
  };
}

function sumERC4626VaultsExport2({ vaults, ...options }) {
  return async (api) => {
    await sumERC4626Vaults({ isOG4626: true, ...options, api, calls: vaults });
    return sumTokens2({ api });
  };
}

module.exports = {
  sumERC4626Vaults,
  sumERC4626VaultsExport,
  sumERC4626VaultsExport2,
};