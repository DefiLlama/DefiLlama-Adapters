const SCHEMA = 'tvl-baseline-v1';
const NEGLIGIBLE_USD = 1;
const NEGLIGIBLE_PCT = 0.01;
const SIGNIFICANT_PCT = 0.1;
const COLLAPSE_MIN_QUIET = 3;

function formatUsd(amount) {
  if (amount == null || !Number.isFinite(amount)) return '—';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs === 0) return '$0';
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}k`;
  return `${sign}$${abs.toFixed(2)}`;
}

function formatSignedUsd(amount) {
  if (amount == null || !Number.isFinite(amount)) return '—';
  if (amount === 0) return '$0';
  if (amount > 0) return '+' + formatUsd(amount);
  return formatUsd(amount);
}

function formatPct(baseline, current) {
  if (baseline == null && current == null) return '—';
  if (baseline == null || baseline === 0) {
    if (current == null || current === 0) return '0%';
    return 'new';
  }
  if (current == null) return 'removed';
  const pct = ((current - baseline) / Math.abs(baseline)) * 100;
  if (Math.abs(pct) < NEGLIGIBLE_PCT) return '0%';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function classifyDelta(baseline, current) {
  const b = baseline ?? null;
  const c = current ?? null;
  if (b == null && c != null) return 'added';
  if (b != null && c == null) return 'removed';
  if (b != null && c != null) {
    if (Math.abs(c - b) < NEGLIGIBLE_USD) return 'unchanged';
    return 'changed';
  }
  return 'unchanged';
}

function computeRows(baselineTotals, currentTotals) {
  const keys = new Set([...Object.keys(baselineTotals || {}), ...Object.keys(currentTotals || {})]);
  keys.delete('tvl');

  const rows = [];
  for (const key of keys) {
    const baseline = baselineTotals?.[key] ?? null;
    const current = currentTotals?.[key] ?? null;
    rows.push({
      label: key,
      baseline,
      current,
      delta: baseline != null && current != null ? current - baseline : null,
      classification: classifyDelta(baseline, current),
    });
  }

  rows.sort((a, b) => {
    const mag = r => Math.max(Math.abs(r.delta ?? 0), Math.abs(r.current ?? 0), Math.abs(r.baseline ?? 0));
    return mag(b) - mag(a);
  });

  return rows;
}

function partitionRows(rows) {
  const significant = [];
  const quiet = [];
  for (const row of rows) {
    if (row.classification === 'added' || row.classification === 'removed') {
      significant.push(row);
    } else if (row.baseline == null || row.baseline === 0) {
      significant.push(row);
    } else {
      const pct = Math.abs(((row.current ?? 0) - row.baseline) / row.baseline) * 100;
      (pct >= SIGNIFICANT_PCT ? significant : quiet).push(row);
    }
  }
  return { significant, quiet };
}

function renderTotalRow(baseline, current) {
  const b = baseline?.totals?.tvl ?? null;
  const c = current?.totals?.tvl ?? null;
  const delta = b != null && c != null ? c - b : null;
  return `| **total** | ${formatUsd(b)} | ${formatUsd(c)} | ${formatSignedUsd(delta)} | ${formatPct(b, c)} |`;
}

function renderChainRow(row) {
  const deltaCell = row.classification === 'added' || row.classification === 'removed'
    ? formatSignedUsd(row.classification === 'added' ? row.current : -row.baseline)
    : formatSignedUsd(row.delta);
  return `| ${row.label} | ${formatUsd(row.baseline)} | ${formatUsd(row.current)} | ${deltaCell} | ${formatPct(row.baseline, row.current)} |`;
}

function computeDiff({ baseline, current, adapterPath }) {
  if (!baseline || baseline.schema !== SCHEMA) {
    throw new Error(`computeDiff: baseline missing or wrong schema (got ${baseline?.schema})`);
  }
  if (!current || current.schema !== SCHEMA) {
    throw new Error(`computeDiff: current missing or wrong schema (got ${current?.schema})`);
  }

  const { significant, quiet } = partitionRows(computeRows(baseline.totals, current.totals));
  const collapse = quiet.length >= COLLAPSE_MIN_QUIET;

  const lines = [
    `### TVL diff for \`${adapterPath}\``,
    '',
    '| | Baseline | This PR | Δ | Δ% |',
    '|---|---:|---:|---:|---:|',
    renderTotalRow(baseline, current),
    ...significant.map(renderChainRow),
  ];

  if (collapse) {
    lines.push(`| _${quiet.length} other chains_ |  |  |  | _no significant change_ |`);
    lines.push('', '<details><summary>Full per-chain table</summary>', '');
    lines.push('| | Baseline | This PR | Δ | Δ% |', '|---|---:|---:|---:|---:|');
    lines.push(...quiet.map(renderChainRow));
    lines.push('', '</details>');
  } else {
    lines.push(...quiet.map(renderChainRow));
  }

  if (baseline.fileSha || baseline.capturedAt) {
    const parts = [];
    if (baseline.capturedAt) parts.push(baseline.capturedAt);
    if (baseline.fileSha) parts.push(`main@\`${baseline.fileSha.slice(0, 7)}\``);
    lines.push('', `_Baseline captured ${parts.join(' from ')}._`);
  }

  return lines.join('\n');
}

module.exports = { computeDiff, formatUsd, formatSignedUsd, formatPct, classifyDelta, partitionRows };
