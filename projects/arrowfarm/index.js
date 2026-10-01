const { getLogs } = require('../helper/cache/getLogs');

// The factory has no enumeration getter, only a creation event, so the
// event log is how vaults are discovered.
const FACTORY = '0x086d837E84A59aB0E91861A773c8130ce4265440';
const FACTORY_DEPLOY_BLOCK = 67633904;

// Platform token, used only to route its own pool to pool2 instead of tvl.
const ARROWFARM = '0x416d0c4b431cfa33b4a4974e3dfc9f5089137148';

const wantsAbi = 'function wants() view returns (address token0, address token1)';
const balancesAbi = 'function balances() view returns (uint256 amount0, uint256 amount1)';

// balances() is the vault's own accounting of what it holds in its LP
// position plus idle balance; a plain balanceOf would miss the deployed
// share.
async function getVaultBalances(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    eventAbi: 'event ProxyCreated(address proxy)',
    fromBlock: FACTORY_DEPLOY_BLOCK,
    onlyArgs: true,
  });
  const vaults = logs.map((log) => log.proxy);
  if (vaults.length === 0) return [];

  const [wants, balances] = await Promise.all([
    api.multiCall({ abi: wantsAbi, calls: vaults, permitFailure: true }),
    api.multiCall({ abi: balancesAbi, calls: vaults, permitFailure: true }),
  ]);

  return vaults
    .map((vault, i) => ({ wants: wants[i], balances: balances[i] }))
    .filter(({ wants, balances }) => wants && balances);
}

async function tvl(api) {
  const vaults = await getVaultBalances(api);
  vaults.forEach(({ wants, balances }) => {
    const { token0, token1 } = wants;
    const { amount0, amount1 } = balances;
    if (token0.toLowerCase() === ARROWFARM || token1.toLowerCase() === ARROWFARM) return;
    api.add(token0, amount0);
    api.add(token1, amount1);
  });
}

// Own-token pools go to pool2, not base tvl, per DefiLlama convention.
async function pool2(api) {
  const vaults = await getVaultBalances(api);
  vaults.forEach(({ wants, balances }) => {
    const { token0, token1 } = wants;
    const { amount0, amount1 } = balances;
    if (token0.toLowerCase() !== ARROWFARM && token1.toLowerCase() !== ARROWFARM) return;
    api.add(token0, amount0);
    api.add(token1, amount1);
  });
}

module.exports = {
  methodology:
    "TVL sums each ArrowVaultConcLiq vault's token0/token1 balances() on Robinhood Chain, with vaults discovered from the vault factory's ProxyCreated logs so new vaults are picked up automatically. The ARROWFARM-USDG vault is reported under pool2 instead of base TVL, per convention for a protocol's own-token pools.",
  robinhood: {
    tvl,
    pool2,
  },
};
