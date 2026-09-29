const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

const bUSD0Token = "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0";
const fwUSDC = '0x62F5366C9E21A95326C461a098a408e034e017b3'
const USD0Token = ADDRESSES.ethereum.USD0;
const UZRLendingMarket = "0xa428723eE8ffD87088C36121d72100B43F11fb6A"; // UZR Lending Market (MetaMorpho vault)
const UZRMarketId = "0xa597b5a36f6cc0ede718ba58b2e23f5c747da810bf8e299022d88123ab03340e";
const marketAbi = "function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)";

async function borrowed_v0(api) {
  const marketData = await api.call({ target: UZRLendingMarket, abi: marketAbi, params: [UZRMarketId] });
  api.add(USD0Token, marketData.totalBorrowAssets);
  return api.getBalances()
}

const v0Tvl = {
  ethereum: {
    tvl: sumTokensExport({
      tokens: [USD0Token,],  // bUSD0 is intentionally excluded as it is a derivative of USD0, and including it would lead to double counting
      owners: [UZRLendingMarket],
    }),
    borrowed: borrowed_v0,
  },
};

const { getMarketCreationLogs, FIXED_LENDING_MARKET, VARIABLE_LENDING_MARKET } = require("../fira/treasuryHelper");
const { mergeExports } = require('../helper/utils');

async function tvl(api) {
  let [fixed, variable,] = await Promise.all([
    getMarketCreationLogs(api, FIXED_LENDING_MARKET),
    getMarketCreationLogs(api, VARIABLE_LENDING_MARKET),
  ]);
  fixed = fixed.map(i => [i.marketParams.loanToken, i.marketParams.collateralToken]).flat()
  variable = variable.map(i => [i.marketParams.loanToken, i.marketParams.collateralToken]).flat()

  const ownerTokens = [
    [fixed, FIXED_LENDING_MARKET],
    [variable, VARIABLE_LENDING_MARKET],
    [[ADDRESSES.ethereum.USDC], fwUSDC], // fwUSDC is a wrapper around USDC, so we need to include it in the TVL calculation to avoid undercounting.
  ]

  const allTokens = ownerTokens.flatMap(i => i[0])
  const allNames = await api.multiCall({ abi: 'string:name', calls: allTokens, permitFailure: true })
  const blacklistedTokens = allTokens.filter((_, i) => allNames[i]?.toLowerCase().includes("fira"))  // exclude all fira wrapped tokens from the tvl, we are including the USDC backing it

  // TVL must not include borrowed amounts: we only sum the coins actually held by the fixed/variable
  // lending-market contracts (cash reserves + posted collateral).
  return api.sumTokens({ ownerTokens, blacklistedTokens })
}

async function borrowed(api) {
  // Borrowed is tracked separately from TVL.
  // we compute borrowed debt from fixed-rate markets only. For variable markets we use the same methodology as morpho.
  const fixed = await getMarketCreationLogs(api, FIXED_LENDING_MARKET)
  const variable = await getMarketCreationLogs(api, VARIABLE_LENDING_MARKET)
  const calls = fixed.map(i => ({ target: FIXED_LENDING_MARKET, params: i.marketParams })).concat(variable.map(i => ({ target: VARIABLE_LENDING_MARKET, params: i.marketParams })))
  const markets = fixed.concat(variable)


  const marketData = await api.multiCall({ abi: marketAbi, calls, permitFailure: true, });

  markets.forEach((m, i) => {
    const data = marketData[i];
    if (!data || data.totalBorrowAssets == null) return;

    api.add(m.marketParams.loanToken, data.totalBorrowAssets);
  });
  const allTokens = markets.map(m => m.marketParams.loanToken)
  const allNames = await api.multiCall({ abi: 'string:name', calls: allTokens, permitFailure: true })
  const blacklistedTokens = allTokens.filter((_, i) => allNames[i]?.toLowerCase().includes("fira"))
  blacklistedTokens.forEach(t => api.removeTokenBalance(t))
  return api.getBalances()
}

const v1Tvl = {
  methodology:
    "TVL: Total value of all coins held in the smart contracts of the protocol (fixed + variable lending markets).\n" +
    "Borrowed: Total value of outstanding debt across live Fira markets.",
  ethereum: {
    tvl,
    borrowed,
  },
};

module.exports = mergeExports([v0Tvl, v1Tvl]);