const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const terminal = require("./terminal");
const {
  kncAddr,
  xaaveaAddr,
  xaavebAddr,
  xalphaaAddr,
  alphaAddr,
  xbntaAddr,
  bntAddr,
  xinchaAddr,
  xinchbAddr,
  xkncaAddr,
  xkncbAddr,
  xsnxaAdminAddr,
  xsnxaTradeAccountingAddr,
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpcAddr,
  xu3lpdAddr,
  xu3lpeAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
  ethrsi6040Addr,
  snxAddr,
  wbtcAddr,
  wethAddr,
  snxTokenAddr,
  inchAddr,
  usdcAddr,
  aaveAddr,
} = require("./constants");
const BigNumber = require('bignumber.js');
const xu3lps = [
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpcAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
];

async function tvl(timestamp, block) {
  let balances = {};

  const xaaveTvlRaw = (
    await sdk.api.abi.multiCall({
      calls: [xaaveaAddr, xaavebAddr].map((a) => ({ target: a })),
      abi: abi.getFundHoldings,
      block,
    })
  ).output
    .map((r) => r.output)
    .reduce((a, b) => a + +b, 0);
  sdk.util.sumSingleBalance(balances, aaveAddr, xaaveTvlRaw);

  const xu3lpTvlRaw = (
    await sdk.api.abi.multiCall({
      calls: xu3lps.map((a) => ({ target: a })),
      abi: abi.getNav,
      block,
    })
  ).output
    .map((r) => r.output)
    .reduce((a, b) => a + +b, 0);
  sdk.util.sumSingleBalance(balances, usdcAddr, xu3lpTvlRaw / 10 ** 12);

  const xu3lpdTvlRaw = (
    await sdk.api.abi.call({
      target: xu3lpdAddr,
      abi: abi.getNav,
      block,
    })
  ).output
  sdk.util.sumSingleBalance(balances, wethAddr, xu3lpdTvlRaw);

  const xu3lpeTvlRaw = (
    await sdk.api.abi.call({
      target: xu3lpeAddr,
      abi: abi.getNav,
      block,
    })
  ).output
  sdk.util.sumSingleBalance(balances, wbtcAddr, xu3lpeTvlRaw / 10 ** 10);

  const xinchTvlRaw = (
    await sdk.api.abi.multiCall({
      calls: [xinchaAddr, xinchbAddr].map((a) => ({ target: a })),
      abi: abi.getNav,
      block,
    })
  ).output
    .map((r) => r.output)
    .reduce((a, b) => a + +b, 0);
  sdk.util.sumSingleBalance(balances, inchAddr, xinchTvlRaw);

  const xbntaStakedRaw = (
    await sdk.api.abi.call({
      target: xbntaAddr,
      abi: abi.totalAllocatedNav,
      block
    })
  ).output;
  const xbntaBufferRaw = (
    await sdk.api.abi.call({
      target: xbntaAddr,
      abi: abi.getBufferBalance,
      block
    })
  ).output;
  const xbntaPendingRaw = (
    await sdk.api.abi.call({
      target: xbntaAddr,
      abi: abi.getRewardsContributionToNav,
      block
    })
  ).output;
  sdk.util.sumSingleBalance(balances, bntAddr, xbntaStakedRaw);
  sdk.util.sumSingleBalance(balances, bntAddr, xbntaBufferRaw);
  sdk.util.sumSingleBalance(balances, bntAddr, xbntaPendingRaw);

  const xkncTvlRaw = (
    await sdk.api.abi.multiCall({
      calls: [xkncaAddr, xkncbAddr].map((a) => ({ target: a })),
      abi: abi.getFundKncBalanceTwei,
      block,
    })
  ).output
    .map((r) => r.output)
    .reduce((a, b) => a + +b, 0);
  sdk.util.sumSingleBalance(balances, kncAddr, xkncTvlRaw);

  const xalphaaTvlRaw = (
    await sdk.api.abi.call({
      target: xalphaaAddr,
      abi: abi.getNav,
      block
    })
  ).output;
  sdk.util.sumSingleBalance(balances, alphaAddr, xalphaaTvlRaw);
  const xsnxaSnxRaw = (
    await sdk.api.abi.call({
      abi: abi.getSnxBalance,
      target: xsnxaTradeAccountingAddr,
      block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, snxTokenAddr, xsnxaSnxRaw);
  const xsnxaEthRaw = (
    await sdk.api.abi.call({
      abi: abi.getEthBalance,
      target: xsnxaTradeAccountingAddr,
      block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, wethAddr, xsnxaEthRaw);
  const xsnxaEthrsi6040Raw = (
    await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      target: ethrsi6040Addr,
      params: xsnxaAdminAddr,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ethrsi6040Addr, xsnxaEthrsi6040Raw);
    const xsnxaSusdRaw = (await sdk.api.abi.call({
      abi: abi.debtBalanceOf,
      target: snxAddr,
      params: [xsnxaAdminAddr, '0x7355534400000000000000000000000000000000000000000000000000000000'],
      block,
    })).output;
  sdk.util.sumSingleBalance(
      balances,
      ADDRESSES.ethereum.sUSD,
      xsnxaSusdRaw
  );

  Object.keys(balances).forEach(key => balances[key] = BigNumber(balances[key]).toFixed(0))

  return terminal.getData("mainnet", block, balances);
}

async function fetchOptimism() {
  return terminal.getData("optimism");
}

async function fetchArbitrum() {
  return terminal.getData("arbitrum");
}

async function fetchPolygon() {
  return terminal.getData("polygon");
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  ethereum:{
    tvl,
  },
  arbitrum: {
    tvl: fetchArbitrum,
  },
  optimism: {
    tvl: fetchOptimism,
  },
  polygon: {
    tvl: fetchPolygon,
  },
  methodology: `TVL includes deposits made to xToken Terminal and xToken Market.`,
};
