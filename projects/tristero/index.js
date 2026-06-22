const { lendingMarket } = require("../helper/methodologies");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    start: '2026-03-19',
    // Keep the legacy Arbitrum escrow included so migrated history and any still-open
    // legacy positions continue to count after the new shared deployment went live
    escrows: ['0x270f529f16A578AAD524B94e34f579a51E00611C', '0xe400000df2f227133ff74c662c9e935439471d2e'],
  },
  base: {
    start: '2026-04-02',
    escrows: ['0xe400000df2f227133ff74c662c9e935439471d2e'],
  },
  ethereum: {
    start: '2026-04-02',
    escrows: ['0xe400000df2f227133ff74c662c9e935439471d2e'],
  },
};

const abis = {
  totalPositions: 'function totalPositions() view returns (uint128)',
  positions: 'function positions(uint128) view returns (address taker, address filler, address token, address loanToken, uint256 size, uint256 loanAmount, uint256 liqPrice)',
  totalDebt: 'function totalDebt(uint128) view returns (uint256)',
};

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

async function tvl(api) {
  const positions = await getActivePositions(api);
  const tokens = [...new Set(positions.map(p => p.token))];
  const owners = config[api.chain]?.escrows || [];
  return sumTokens2({ api, tokens, owners });
}

async function borrowed(api) {
  const positions = await getActivePositions(api);
  if (!positions.length) return;

  const debts = await api.multiCall({
    abi: abis.totalDebt,
    calls: positions.map(p => ({ target: p.escrow, params: [p.positionId] })),
    permitFailure: true,
  });

  positions.forEach((pos, i) => {
    if (debts[i] && debts[i] !== '0') api.add(pos.loanToken, debts[i]);
  });
}

module.exports = {
  methodology: `${lendingMarket} Tristero TVL counts the base asset collateral locked in active margin escrows. Borrowed exports the outstanding debt of open margin positions in the loan token.`,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    start: config[chain].start,
    tvl,
    borrowed,
  };
});