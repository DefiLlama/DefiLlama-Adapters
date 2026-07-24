const { getLogs2 } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');

const SPLITS_SMARTVAULT_FACTORY = '0x8E6Af8Ed94E87B4402D0272C5D6b0D47F0483e7C';
const EMPIRE_SALT_PREFIX = '656d70697265'; // "empire" ASCII, hex, no 0x

const SMARTVAULT_CREATED_TOPIC = '0x7e34a0bc0f69171696cf91039a2a199a6a0464532bc61e48f72e8fb1ff429084';
const SMARTVAULT_CREATED_EVENT = 'event SmartVaultCreated(address indexed vault, address owner, (bytes32 slot1, bytes32 slot2)[] signers, uint8 threshold, uint256 salt)';
const STAKED_EVENT = 'event Staked(uint256 indexed stakeId, address indexed token, address indexed owner, uint256 amount, uint40 unlockTime, uint256 lockDuration)';

const CONFIG = {
  base: {
    stakingLocker: '0x028088649924c6c277d22F79AAd8A258FF80e26A',
    factoryFromBlock: 41558963,
    lockerFromBlock: 45540637,
    quoteAssets: [ADDRESSES.base.WETH, ADDRESSES.base.USDC],
  },
  arbitrum: {
    stakingLocker: '0x2107412baA05470F159c025F688E97CBeADD34c0',
    factoryFromBlock: 487300089,
    lockerFromBlock: 459254798,
    quoteAssets: [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC],
  },
};

function saltToHex64(salt) {
  return BigInt(salt.toString()).toString(16).padStart(64, '0');
}

async function getEmpireVaults(api) {
  const logs = await getLogs2({
    api,
    target: SPLITS_SMARTVAULT_FACTORY,
    fromBlock: CONFIG[api.chain].factoryFromBlock,
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

async function tvl(api) {
  const cfg = CONFIG[api.chain];

  const vaults = await getEmpireVaults(api);
  const owners = vaults.map((v) => v.vault);
  if (owners.length) await api.sumTokens({ owners, tokens: [ADDRESSES.null, ...cfg.quoteAssets] });

  await api.sumTokens({ owner: cfg.stakingLocker, tokens: [ADDRESSES.null, ...cfg.quoteAssets] });
}

async function staking(api) {
  const cfg = CONFIG[api.chain];
  const quote = new Set([ADDRESSES.null, ...cfg.quoteAssets].map((t) => t.toLowerCase()));

  const vaults = await getEmpireVaults(api);
  const ownerTokens = vaults.filter((v) => !quote.has(v.baseToken.toLowerCase())).map((v) => [[v.baseToken], v.vault]);
  if (ownerTokens.length) await api.sumTokens({ ownerTokens, permitFailure: true });

  const logs = await getLogs2({
    api,
    target: cfg.stakingLocker,
    fromBlock: cfg.lockerFromBlock,
    eventAbi: STAKED_EVENT,
    extraKey: 'empire-staked-tokens',
  });
  const stakedTokens = [...new Set(logs.map((l) => l.token.toLowerCase()))].filter((t) => !quote.has(t));
  if (stakedTokens.length) await api.sumTokens({ owner: cfg.stakingLocker, tokens: stakedTokens, permitFailure: true });
}

module.exports = {
  methodology:
    'TVL counts real capital paired with the empires: native ETH plus quote assets (WETH, USDC) held in every Empire ' +
    'SmartVault treasury (Base) and in the StakingLocker. Empire treasuries are identified among the shared Splits ' +
    'factory deployments by their "empire" CREATE2 salt prefix. Staking counts each empire\'s token ' +
    'held in its vault treasury or locked in the StakingLocker.',
  base: { tvl, staking },
  arbitrum: { tvl, staking },
};
