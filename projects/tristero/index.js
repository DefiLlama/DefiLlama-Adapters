const { lendingMarket } = require("../helper/methodologies");
const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const AUSD = '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a';
const SHARED_MARGIN_VAULT = '0xB49781E8c39c75f413C1178f395bF68b0BEE8d00';
const SHARED_ESCROW = '0xe400000df2f227133ff74c662c9e935439471d2e';
const V3_VAULT_START = '2026-06-09';

const config = {
  arbitrum: {
    start: '2026-03-19',
    // Keep the legacy Arbitrum escrow included so migrated history and any still-open
    // legacy positions continue to count after the new shared deployment went live
    escrows: ['0x270f529f16A578AAD524B94e34f579a51E00611C', SHARED_ESCROW],
    vaults: [{ vault: SHARED_MARGIN_VAULT, start: V3_VAULT_START, tokens: [ADDRESSES.arbitrum.USDC_CIRCLE] }],
  },
  base: {
    start: '2026-04-02',
    escrows: [SHARED_ESCROW],
    vaults: [{ vault: SHARED_MARGIN_VAULT, start: V3_VAULT_START, tokens: [ADDRESSES.base.USDC] }],
  },
  ethereum: {
    start: '2026-04-02',
    escrows: [SHARED_ESCROW],
    vaults: [{ vault: SHARED_MARGIN_VAULT, start: V3_VAULT_START, tokens: [AUSD] }],
  },
};

const abis = {
  totalPositions: 'function totalPositions() view returns (uint128)',
  positions: 'function positions(uint128) view returns (address taker, address filler, address token, address loanToken, uint256 size, uint256 loanAmount, uint256 liqPrice)',
  totalDebt: 'function totalDebt(uint128) view returns (uint256)',
  getTVOL: 'function getTVOL(address _token) view returns (uint256)',
  balanceOf: 'erc20:balanceOf',
};

function isActive(api, start) {
  return !api.timestamp || api.timestamp >= Date.parse(`${start}T00:00:00Z`) / 1000;
}

function toBigInt(value) {
  if (value === undefined || value === null) return 0n;
  return BigInt(value.toString());
}

function getActiveVaults(api) {
  return (config[api.chain]?.vaults || []).filter(({ start }) => isActive(api, start));
}

async function getActivePositions(api) {
  const escrows = config[api.chain]?.escrows || [];
  if (!escrows.length) return [];

  const totals = await api.multiCall({ abi: abis.totalPositions, calls: escrows, permitFailure: true });

  const allPositions = [];
  for (let i = 0; i < escrows.length; i++) {
    const total = Number(totals[i] || 0);
    if (!total) continue;
    const ids = Array.from({ length: total }, (_, j) => j + 1);
    const positions = await api.multiCall({
      abi: abis.positions,
      calls: ids.map(id => ({ target: escrows[i], params: [id] })),
      permitFailure: true,
    });
    positions.forEach((pos, j) => {
      if (pos && pos.size !== '0') allPositions.push({ escrow: escrows[i], positionId: ids[j], ...pos });
    });
  }
  return allPositions;
}

async function addVaultBorrowed(api) {
  const vaultPositions = getActiveVaults(api).flatMap(({ vault, tokens }) => tokens.map(token => ({ vault, token })));
  if (!vaultPositions.length) return;

  const [tvls, idleBalances] = await Promise.all([
    api.multiCall({
      abi: abis.getTVOL,
      calls: vaultPositions.map(({ vault, token }) => ({ target: vault, params: [token] })),
      permitFailure: true,
    }),
    api.multiCall({
      abi: abis.balanceOf,
      calls: vaultPositions.map(({ vault, token }) => ({ target: token, params: [vault] })),
      permitFailure: true,
    }),
  ]);

  vaultPositions.forEach(({ token }, i) => {
    const borrowed = toBigInt(tvls[i]) - toBigInt(idleBalances[i]);
    if (borrowed > 0n) api.add(token, borrowed.toString());
  });
}

async function tvl(api) {
  const positions = await getActivePositions(api);
  const tokens = [...new Set(positions.map(p => p.token))];
  const owners = config[api.chain]?.escrows || [];
  const tokensAndOwners = getActiveVaults(api).flatMap(({ vault, tokens }) => tokens.map(token => [token, vault]));
  await sumTokens2({ api, tokens, owners, tokensAndOwners });
}

async function borrowed(api) {
  const positions = await getActivePositions(api);
  if (positions.length) {
    const debts = await api.multiCall({
      abi: abis.totalDebt,
      calls: positions.map(p => ({ target: p.escrow, params: [p.positionId] })),
      permitFailure: true,
    });

    positions.forEach((pos, i) => {
      if (debts[i] && debts[i] !== '0') api.add(pos.loanToken, debts[i]);
    });
  }

  await addVaultBorrowed(api);
}

module.exports = {
  methodology: `${lendingMarket} Tristero TVL counts the base asset collateral locked in active margin escrows and v3 margin vault deposits. Borrowed exports outstanding legacy position debt plus v3 vault assets lent out, calculated as getTVOL() minus idle vault balance.`,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    start: config[chain].start,
    tvl,
    borrowed,
  };
});
