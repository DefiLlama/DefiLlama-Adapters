const { lendingMarket } = require("../helper/methodologies");

const config = {
  arbitrum: {
    start: '2026-03-19',
    escrows: [
      // Keep the legacy Arbitrum escrow included so migrated history and any still-open
      // legacy positions continue to count after the new shared deployment went live.
      { address: '0x270f529f16A578AAD524B94e34f579a51E00611C', start: '2026-03-19' },
      { address: '0xe400000df2f227133ff74c662c9e935439471d2e', start: '2026-04-02' },
    ],
  },
  base: {
    start: '2026-04-02',
    escrows: [
      { address: '0xe400000df2f227133ff74c662c9e935439471d2e', start: '2026-04-02' },
    ],
  },
  ethereum: {
    start: '2026-04-02',
    escrows: [
      { address: '0xe400000df2f227133ff74c662c9e935439471d2e', start: '2026-04-02' },
    ],
  },
};

const abis = {
  totalPositions: 'function totalPositions() view returns (uint128)',
  positions: 'function positions(uint128) view returns (address taker, address filler, address token, address loanToken, uint256 size, uint256 loanAmount, uint256 liqPrice)',
  totalDebt: 'function totalDebt(uint128) view returns (uint256)',
};

function getPositionIds(totalPositions) {
  const total = Number(totalPositions);
  return Array.from({ length: total }, (_, index) => index + 1);
}

function normalizePosition(position) {
  if (!position) return null;

  const token = position.token ?? position[2];
  const loanToken = position.loanToken ?? position[3];
  const size = BigInt(position.size ?? position[4] ?? '0');
  const loanAmount = BigInt(position.loanAmount ?? position[5] ?? '0');

  if (!token || !loanToken || size === 0n) return null;

  return {
    token,
    loanToken,
    size,
    loanAmount,
  };
}

function getActiveEscrows(api) {
  const chainConfig = config[api.chain];
  if (!chainConfig) return [];

  const date = new Date((api.timestamp ?? 0) * 1000).toISOString().slice(0, 10);
  return chainConfig.escrows
    .filter(({ start, end }) => date >= start && (!end || date <= end))
    .map(({ address }) => address);
}

async function getActivePositions(api) {
  const escrows = getActiveEscrows(api);
  if (!escrows.length) return [];

  const positionsPerEscrow = await Promise.all(escrows.map(async (escrow) => {
    const totalPositions = await api.call({ target: escrow, abi: abis.totalPositions, permitFailure: true });
    const positionIds = getPositionIds(totalPositions);
    if (!positionIds.length) return [];

    const positions = await api.multiCall({
      abi: abis.positions,
      calls: positionIds.map((positionId) => ({ target: escrow, params: [positionId] })),
      permitFailure: true,
    });

    return positions
      .map((position, index) => ({ escrow, positionId: positionIds[index], position: normalizePosition(position) }))
      .filter((entry) => entry.position);
  }));

  return positionsPerEscrow.flat();
}

async function tvl(api) {
  const activePositions = await getActivePositions(api);
  activePositions.forEach(({ position }) => {
    api.add(position.token, position.size.toString());
  });
}

async function borrowed(api) {
  const activePositions = await getActivePositions(api);
  if (!activePositions.length) return;

  const debts = await api.multiCall({
    abi: abis.totalDebt,
    calls: activePositions.map(({ escrow, positionId }) => ({ target: escrow, params: [positionId] })),
    permitFailure: true,
  });

  activePositions.forEach(({ position }, index) => {
    const debt = debts[index];
    const amount = debt ?? position.loanAmount.toString();
    if (!amount || amount === '0') return;
    api.add(position.loanToken, amount.toString());
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
