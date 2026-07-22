/**
 * DeFiLlama TVL adapter — Empire Builder (empirebuilder.world)
 * -----------------------------------------------------------------------------
 * This is the file to copy into a fork of DefiLlama/DefiLlama-Adapters as
 *   projects/empire-builder/index.js
 * It is kept here in our repo only as the source of truth. It is plain CommonJS
 * for the DeFiLlama SDK runtime — it is NOT imported by the Next.js app.
 *
 * TVL = (1) assets held in every Empire SmartVault treasury
 *     + (2) tokens locked in the StakingLocker
 * all read directly from chain at the queried block (DeFiLlama's preferred tier —
 * no subgraph, no centralized API).
 *
 * HOW WE ISOLATE OUR VAULTS
 * Empire treasuries are deployed through the *shared* Splits SmartVault factory
 * (the same factory every Splits user shares), so we cannot filter by factory.
 * Instead we read every `SmartVaultCreated` event and keep only those whose
 * CREATE2 `salt` carries our "empire" marker: the uint256 salt for a token empire
 * is  0x656d70697265 ("empire") | 6 zero bytes | <baseToken address>. Main and
 * additional treasuries (empire, empire2..empire5) all share the leading
 * 0x656d70697265 prefix, so a single prefix test selects all of them, and the
 * low 20 bytes hand us the empire's base token for free.
 *
 * The same prefix covers tokenless (Farcaster) empires from the salt-migration onward — their
 * salts are also built with the "empire" prefix (see src/contracts/v3Contracts.ts). Tokenless
 * empires deployed before that migration used a keccak salt with no marker and are not indexed.
 */

const SPLITS_SMARTVAULT_FACTORY = '0x8E6Af8Ed94E87B4402D0272C5D6b0D47F0483e7C'; // same on Base + Arbitrum
const EMPIRE_SALT_PREFIX = '656d70697265'; // "empire" ASCII, hex, no 0x
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'; // native gas token in DeFiLlama sumTokens

const SMARTVAULT_CREATED_EVENT =
  'event SmartVaultCreated(address indexed vault, address owner, (bytes32 slot1, bytes32 slot2)[] signers, uint8 threshold, uint256 salt)';
const STAKED_EVENT =
  'event Staked(uint256 indexed stakeId, address indexed token, address indexed owner, uint256 amount, uint40 unlockTime, uint256 lockDuration)';

/**
 * Per-chain config. The Splits SmartVault factory is the same address on both chains
 * (SPLITS_SMARTVAULT_FACTORY) but was deployed at a different block on each.
 * WETH/USDC are the canonical addresses on each chain.
 */
const CONFIG = {
  base: {
    factoryFromBlock: 41558963,
    stakingLocker: '0x028088649924c6c277d22F79AAd8A258FF80e26A',
    lockerFromBlock: 45540637,
    quoteAssets: [
      '0x4200000000000000000000000000000000000006', // WETH
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    ],
  },
  arbitrum: {
    factoryFromBlock: 427328324,
    stakingLocker: '0x2107412baA05470F159c025F688E97CBeADD34c0',
    lockerFromBlock: 459254798,
    quoteAssets: [
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC (native)
    ],
  },
};

/** uint256 salt (BigNumber | bigint | string) → 64-char lowercase hex, no 0x. */
function saltToHex64(salt) {
  return BigInt(salt.toString()).toString(16).padStart(64, '0');
}

/** Collect Empire vault addresses (+ their base tokens) from the shared factory. */
async function collectEmpireVaults(api, cfg) {
  const logs = await api.getLogs({
    target: SPLITS_SMARTVAULT_FACTORY,
    fromBlock: cfg.factoryFromBlock,
    toBlock: await api.getBlock(),
    eventAbi: SMARTVAULT_CREATED_EVENT,
    onlyArgs: true,
  });

  const vaults = [];
  for (const log of logs) {
    const saltHex = saltToHex64(log.salt);
    if (!saltHex.startsWith(EMPIRE_SALT_PREFIX)) continue; // not one of ours
    const baseToken = '0x' + saltHex.slice(24); // low 20 bytes = base token (token empires)
    vaults.push({ vault: log.vault, baseToken });
  }
  return vaults;
}

/** Sum the assets held in each Empire treasury: native ETH, quote assets, and its base token. */
async function addVaultTvl(api, cfg) {
  const vaults = await collectEmpireVaults(api, cfg);
  if (!vaults.length) return;
  const owners = vaults.map((v) => v.vault);

  // Native ETH + quote assets (WETH/USDC) — these exist on both chains, so a plain cartesian
  // sum over every vault is safe.
  await api.sumTokens({ owners, tokens: [NULL_ADDRESS, ...cfg.quoteAssets] });

  // Each vault's own base token. On a given chain the base-token contract may not exist (most
  // empire tokens are Base-only; post-migration tokenless salts carry a hash, not a real token),
  // so balanceOf reverts/returns 0x. Read tolerantly and credit only balances that decode.
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: vaults.map(({ vault, baseToken }) => ({ target: baseToken, params: vault })),
    permitFailure: true,
  });
  balances.forEach((bal, i) => {
    if (bal) api.add(vaults[i].baseToken, bal);
  });
}

/** Sum every token ever staked, read from the locker's live balance (nets out unstakes). */
async function addStakingTvl(api, cfg) {
  if (!cfg.stakingLocker || /^0x0+$/.test(cfg.stakingLocker)) return;
  const logs = await api.getLogs({
    target: cfg.stakingLocker,
    fromBlock: cfg.lockerFromBlock,
    toBlock: await api.getBlock(),
    eventAbi: STAKED_EVENT,
    onlyArgs: true,
  });
  const tokens = [...new Set(logs.map((l) => l.token.toLowerCase()))];
  if (!tokens.length) return;
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map((token) => ({ target: token, params: cfg.stakingLocker })),
    permitFailure: true,
  });
  balances.forEach((bal, i) => {
    if (bal) api.add(tokens[i], bal);
  });
}

function tvlForChain(chainKey) {
  return async (api) => {
    const cfg = CONFIG[chainKey];
    await addVaultTvl(api, cfg); // all "empire"-salted vaults (token + post-migration tokenless)
    await addStakingTvl(api, cfg);
    return api.getBalances();
  };
}

module.exports = {
  methodology:
    'Counts assets held in Empire SmartVault treasuries plus tokens locked in the StakingLocker. Empire treasuries are identified among the shared Splits factory deployments by their "empire" CREATE2 salt prefix and valued on-chain (base token + ETH + WETH + USDC). Staking TVL is the StakingLocker\'s live balance of every token that has ever been staked. Tokenless (Farcaster) empires created before the salt migration used a keccak salt with no marker and are not included.',
  base: { tvl: tvlForChain('base') },
  arbitrum: { tvl: tvlForChain('arbitrum') },
};
