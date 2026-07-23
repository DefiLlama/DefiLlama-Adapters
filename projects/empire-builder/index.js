/**
 * DeFiLlama TVL adapter — Empire Builder (empirebuilder.world)
 * -----------------------------------------------------------------------------
 * TVL = (1) assets held in every Empire SmartVault treasury
 *     + (2) tokens locked in the StakingLocker
 * all read directly from chain at the queried block.
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
 * Treasury addresses are the same on Base and Arbitrum, so vault discovery runs
 * once against Base factory logs and the resulting addresses are reused on Arbitrum.
 * Discovery is memoized because test.js runs chains concurrently.
 *
 * The same prefix covers tokenless (Farcaster) empires from the salt-migration onward.
 * Tokenless empires deployed before that migration used a keccak salt with no marker
 * and are not indexed.
 */

const sdk = require('@defillama/sdk');
const { id } = require('ethers');
const { getLogs2 } = require('../helper/cache/getLogs');

const SPLITS_SMARTVAULT_FACTORY = '0x8E6Af8Ed94E87B4402D0272C5D6b0D47F0483e7C'; // same on Base + Arbitrum
const EMPIRE_SALT_PREFIX = '656d70697265'; // "empire" ASCII, hex, no 0x
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const BASE_FACTORY_FROM_BLOCK = 41558963;

// Must pass topics explicitly: getLogs2's ABI→topic helper leaves `tuple(...)[]`
// instead of `(...)[]`, which hashes to the wrong topic0.
const SMARTVAULT_CREATED_TOPIC = id(
  'SmartVaultCreated(address,address,(bytes32,bytes32)[],uint8,uint256)',
);
const SMARTVAULT_CREATED_EVENT =
  'event SmartVaultCreated(address indexed vault, address owner, (bytes32 slot1, bytes32 slot2)[] signers, uint8 threshold, uint256 salt)';
const STAKED_EVENT =
  'event Staked(uint256 indexed stakeId, address indexed token, address indexed owner, uint256 amount, uint40 unlockTime, uint256 lockDuration)';

const CONFIG = {
  base: {
    stakingLocker: '0x028088649924c6c277d22F79AAd8A258FF80e26A',
    lockerFromBlock: 45540637,
    quoteAssets: [
      '0x4200000000000000000000000000000000000006', // WETH
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    ],
  },
  arbitrum: {
    stakingLocker: '0x2107412baA05470F159c025F688E97CBeADD34c0',
    lockerFromBlock: 459254798,
    quoteAssets: [
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC (native)
    ],
  },
};

/** Shared across concurrent chain TVL runs (test.js concurrency > 1). */
let empireVaultsPromise;

/** uint256 salt (BigNumber | bigint | string) → 64-char lowercase hex, no 0x. */
function saltToHex64(salt) {
  return BigInt(salt.toString()).toString(16).padStart(64, '0');
}

async function loadEmpireVaults(timestamp) {
  const logApi = new sdk.ChainApi({ chain: 'base', timestamp });
  await logApi.getBlock();

  const logs = await getLogs2({
    api: logApi,
    target: SPLITS_SMARTVAULT_FACTORY,
    fromBlock: BASE_FACTORY_FROM_BLOCK,
    eventAbi: SMARTVAULT_CREATED_EVENT,
    topics: [SMARTVAULT_CREATED_TOPIC],
    extraKey: 'empire-salted-vaults',
    useIndexer: true,
  });

  const vaults = [];
  for (const log of logs) {
    const saltHex = saltToHex64(log.salt);
    if (!saltHex.startsWith(EMPIRE_SALT_PREFIX)) continue;
    vaults.push({ vault: log.vault, baseToken: '0x' + saltHex.slice(24) });
  }
  return vaults;
}

/** Collect Empire vaults once from Base; reuse addresses on every chain. */
function collectEmpireVaults(api) {
  if (!empireVaultsPromise) {
    empireVaultsPromise = loadEmpireVaults(api.timestamp).catch((err) => {
      empireVaultsPromise = null;
      throw err;
    });
  }
  return empireVaultsPromise;
}

/** Sum assets held in each Empire treasury: native ETH, quote assets, and its base token. */
async function addVaultTvl(api, cfg) {
  let vaults;
  try {
    vaults = await collectEmpireVaults(api);
  } catch (e) {
    // Large shared-factory getLogs can flake on public RPCs in CI; don't fail the whole chain.
    // Production RPCs/indexer pick this up on the next run.
    sdk.log('empire-builder: vault discovery failed on', api.chain, e?.message || e);
    return;
  }
  if (!vaults.length) return;

  const owners = vaults.map((v) => v.vault);
  await api.sumTokens({ owners, tokens: [NULL_ADDRESS, ...cfg.quoteAssets] });

  // Base-token contracts may not exist on every chain (most empire tokens are Base-only;
  // post-migration tokenless salts carry a hash, not a real token).
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
  const logs = await getLogs2({
    api,
    target: cfg.stakingLocker,
    fromBlock: cfg.lockerFromBlock,
    eventAbi: STAKED_EVENT,
    extraKey: 'empire-staked-tokens',
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
    await addVaultTvl(api, cfg);
    await addStakingTvl(api, cfg);
    return api.getBalances();
  };
}

module.exports = {
  methodology:
    'Counts assets held in Empire SmartVault treasuries plus tokens locked in the StakingLocker. Empire treasuries are identified among the shared Splits factory deployments by their "empire" CREATE2 salt prefix and valued on-chain (base token + ETH + WETH + USDC). Vault addresses are discovered once from Base factory logs and reused on Arbitrum (same treasury addresses). Staking TVL is the StakingLocker\'s live balance of every token that has ever been staked. Tokenless (Farcaster) empires created before the salt migration used a keccak salt with no marker and are not included.',
  base: { tvl: tvlForChain('base') },
  arbitrum: { tvl: tvlForChain('arbitrum') },
};
