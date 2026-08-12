const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
  "claimableBaseYield": "uint256:claimableBaseYield",
  "pools": "address[]:pools",
  "currencyToken": "address:currencyToken",
  "liquidityNodes": "function liquidityNodes(uint128 startTick, uint128 endTick) view returns (tuple(uint128 tick, uint128 value, uint128 shares, uint128 available, uint128 pending, uint128 redemptions, uint128 prev, uint128 next)[])",
  "whitelistedTokens": "function whitelistedTokens() external view returns (address[] memory)",
  "loanRouterBalances": "function loanRouterBalances() external view returns (uint256, uint256, uint256)",
  "loanState": "function loanState(bytes32 loanTermsHash) external view returns (uint8, uint64, uint64, uint256)",
  "loanStateV2": "function loanState(bytes32 loanTermsHash) external view returns (uint8, uint16, uint64, uint256)",
  "baseYieldAccrued": "function baseYieldAccrued() external view returns (uint256)",
  "escrowTimelockTotalDeposits": "function totalDeposits() external view returns (uint256)"
};
const { sumTokens2 } = require("../helper/unwrapLPs");
const { gql, request } = require("graphql-request");

// Loan Router Subgraph API
const LOAN_ROUTER_SUBGRAPH_API = 'https://api.goldsky.com/api/public/project_clzibgddg2epg01ze4lq55scx/subgraphs/loan_router_arbitrum/0.0.3/gn';
const LOAN_ROUTER_SUBGRAPH_API_V2 = 'https://api.goldsky.com/api/public/project_cmgziqwja00105np2g1gy6stc/subgraphs/loan_router_v2_arbitrum/latest/gn';

const USDAI_CONTRACT = "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF";
const STAKED_USDAI_CONTRACT = "0x0B2b2B2076d95dda7817e785989fE353fe955ef9";
const QUEUED_DEPOSITOR_CONTRACT = "0x81cc0DEE5e599784CBB4862c605c7003B0aC5A53";
const LOAN_ROUTER_CONTRACT = "0x0C2ED170F2bB1DF1a44292Ad621B577b3C9597D1";
const LOAN_ROUTER_V2_CONTRACT = "0x1C2ED170de32846316784c4fd58A5e3C7563E12f";
const ESCROW_TIMELOCK_CONTRACT = "0x1E710CC0b64E1D7572d35E43AD261587789B6438";
const WRAPPED_M_CONTRACT = "0x437cc33344a0B27A429f795ff6B469C72698B291";
const PYUSD = "0x46850aD61C2B7d64d08c9C754F45254596696984";
const USDC = ADDRESSES.arbitrum.USDC_CIRCLE;
const USDT = ADDRESSES.arbitrum.USDT;
const WHITELISTED_TOKENS = [USDC, USDT, PYUSD];
const LOAN_TOKENS = [USDC, USDT, PYUSD];
const LEGACY_POOL_1 = "0x0f62b8C58E1039F246d69bA2215ad5bF0D2Bb867";
const LEGACY_POOL_2 = "0xcd9d510c4e2fe45e6ed4fe8a3a30eeef3830cc14";
const LEGACY_POOLS = [LEGACY_POOL_1, LEGACY_POOL_2];
const MAX_UINT_128 = "0xffffffffffffffffffffffffffffffff";
const SUBGRAPH_PAGE_SIZE = 1000;
const loanHashesQuery = gql`
  query GetLoanHashes($timestampLte: String!, $first: Int!, $lastId: String!) {
    loanRouterEvents(
      first: $first
      where: {
        type: LoanOriginated,
        timestamp_lte: $timestampLte,
        id_gt: $lastId
      }
      orderBy: id
      orderDirection: asc
    ) {
      id
      loanTermsHash
      timestamp
      loanOriginated {
        currencyToken {
          id
          decimals
        }
      }
    }
  }
`;
// The v2 subgraph tracks a loan entity keyed by loan terms hash, so one query
// covers every loan whether it was originated on v2, migrated from v1, or
// opened by a refinance. A refinance closes the old loan and opens a new one
// under a new hash, so reading the loan entity keeps up with refinance chains.
// Deliberately unfiltered: the entity carries a current status, but a loan that
// is closed today may have been active at the block being valued. The on-chain
// loan state read at that block decides what counts, so this only has to supply
// every hash that has ever existed.
const v2LoansQuery = gql`
  query GetV2Loans($first: Int!, $lastId: String!) {
    loans(
      first: $first
      where: {
        id_gt: $lastId
      }
      orderBy: id
      orderDirection: asc
    ) {
      id
      currencyToken
    }
  }
`;

// Page through a subgraph collection until the full set is collected.
// The subgraph caps a single response at 1000 rows, so we cursor on id
// (id_gt) and loop until a short page signals the end of the data.
// Pass a timestamp only for collections that expose a timestamp field.
async function fetchAllSubgraphRows(endpoint, query, collection, timestamp) {
  const allRows = [];
  let lastId = "";
  while (true) {
    const variables = { first: SUBGRAPH_PAGE_SIZE, lastId };
    if (timestamp !== undefined) variables.timestampLte = String(timestamp);
    const response = await request(endpoint, query, variables);
    const rows = response[collection];
    allRows.push(...rows);
    if (rows.length < SUBGRAPH_PAGE_SIZE) break;
    lastId = rows[rows.length - 1].id;
  }
  return allRows;
}

async function tvl(api) {
  // Get wrapped M tokens in USDai
  const wrappedMBalanceInUsdai = await api.call({
    target: WRAPPED_M_CONTRACT,
    abi: 'erc20:balanceOf',
    params: [USDAI_CONTRACT],
  })

  // Add wrapped M balance in USDai
  api.add(WRAPPED_M_CONTRACT, wrappedMBalanceInUsdai);

  // Get PYUSD balance in USDai
  const pyusdBalanceInUsdai = await api.call({
    target: PYUSD,
    abi: 'erc20:balanceOf',
    params: [USDAI_CONTRACT],
  })

  // Add PYUSD balance in USDai
  api.add(PYUSD, pyusdBalanceInUsdai);

  // Get wrapped M tokens in Staked USDai
  const wrappedMBalanceInStakedUsdai = await api.call({
    target: WRAPPED_M_CONTRACT,
    abi: 'erc20:balanceOf',
    params: [STAKED_USDAI_CONTRACT],
  })

  // Add wrapped M balance in Staked USDai
  api.add(WRAPPED_M_CONTRACT, wrappedMBalanceInStakedUsdai);

  // Claimable wrapped M tokens (to be phased out)
  try {
    const claimableWrappedM = await api.call({
      target: STAKED_USDAI_CONTRACT,
      abi: abi.claimableBaseYield // return value is scaled up by 10^12
    });
    const scaledClaimableWrappedM = BigInt(claimableWrappedM) / (10n ** 12n); // scale down by 10^12 to match wrapped M decimals

    // Add claimable wrapped M tokens
    api.add(WRAPPED_M_CONTRACT, scaledClaimableWrappedM)
  } catch (error) {
    console.error(error);
  }

  // Claimable PYUSD (scaled down by 10^12 to match the decimals of the PYUSD token)
  const claimablePyusd = await api.call({
    target: USDAI_CONTRACT,
    abi: abi.baseYieldAccrued,
  });
  const scaledClaimablePyusd = BigInt(claimablePyusd) / BigInt(10 ** 12);

  // Add claimable PYUSD 
  api.add(PYUSD, scaledClaimablePyusd);

  // Get loan repayment balances in Staked USDai (except USDai)
  // Should be phased out once all repayment balances are zeroed out
  await sumTokens2({
    api,
    owner: STAKED_USDAI_CONTRACT,
    tokens: LOAN_TOKENS,
    permitFailure: true,
  })

  // Add tokens held by the queued depositor  
  await sumTokens2({
    api,
    owner: QUEUED_DEPOSITOR_CONTRACT,
    tokens: WHITELISTED_TOKENS,
    permitFailure: true,
  })
}

async function borrowed(api) {
  // Legacy pools
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: LEGACY_POOLS, permitFailure: true });
  const tokenDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens.map((token) => ({ target: token })),
    permitFailure: true,
  });
  const decimalsMap = {};
  tokens.forEach((token, index) => {
    decimalsMap[token] = tokenDecimals[index];
  });
  const poolsBorrowedValue = (
    await api.multiCall({
      abi: abi.liquidityNodes,
      calls: LEGACY_POOLS.map((pool) => ({
        target: pool,
        params: [0, MAX_UINT_128],
      })),
      permitFailure: true,
    })
  ).map((liquidityNodes, poolIndex) => {
    const token = tokens[poolIndex];
    const decimals = decimalsMap[token];
    if (decimals == null || !liquidityNodes) return 0;
    const scalingFactor = 10 ** (18 - decimals);

    return liquidityNodes.reduce((partialSum, node) => {
      const scaledValue = (+node.value - +node.available) / scalingFactor;
      return partialSum + scaledValue;
    }, 0);
  });
  api.addTokens(tokens, poolsBorrowedValue);

  // Loan router borrowed
  const loanRouterEvents = await fetchAllSubgraphRows(LOAN_ROUTER_SUBGRAPH_API, loanHashesQuery, "loanRouterEvents", api.timestamp);
  const loanStates = await api.multiCall({
    abi: abi.loanState,
    target: LOAN_ROUTER_CONTRACT,
    calls: loanRouterEvents.map((event) => ({ params: [event.loanTermsHash] })),
  });
  loanRouterEvents.forEach((event, i) => {
    // Get the currency token
    const { currencyToken } = event.loanOriginated;

    // Get scaled balance
    const [status, , , scaledBalance] = loanStates[i];

    // If the loan is inactive, continue
    if (+status !== 1) return;

    // If the currency token has more than 18 decimals, continue
    if (currencyToken.decimals > 18) return;

    // Scale down by the decimals of the currency token
    const unscaledBalance = BigInt(scaledBalance) / BigInt(10 ** (18 - currencyToken.decimals));

    // Add the balance to the TVL
    api.add(currencyToken.id, unscaledBalance);
  });


  // Loan router v2 borrowed (originated on v2, migrated from v1, or refinanced)
  const v2Loans = await fetchAllSubgraphRows(LOAN_ROUTER_SUBGRAPH_API_V2, v2LoansQuery, "loans");

  // The loan entity carries the currency token address but not its decimals
  const v2CurrencyTokens = [...new Set(v2Loans.map((loan) => loan.currencyToken))];
  const v2TokenDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: v2CurrencyTokens.map((token) => ({ target: token })),
    permitFailure: true,
  });
  const v2DecimalsMap = {};
  v2CurrencyTokens.forEach((token, index) => {
    v2DecimalsMap[token] = v2TokenDecimals[index];
  });

  // Every loan hash is checked against the loan state at the block being valued,
  // which is what makes historical runs correct in both directions: loans that
  // did not exist yet report status 0, and loans closed since then report their
  // status at that block rather than their status today.
  const v2LoanStates = await api.multiCall({
    abi: abi.loanStateV2,
    target: LOAN_ROUTER_V2_CONTRACT,
    calls: v2Loans.map((loan) => ({ params: [loan.id] })),
  });
  v2Loans.forEach((loan, i) => {
    // Get scaled balance
    const [status, , , scaledBalance] = v2LoanStates[i];

    // If the loan is inactive, continue
    if (+status !== 1) return;

    // If the currency token decimals are unknown or above 18, continue
    const decimals = v2DecimalsMap[loan.currencyToken];
    if (decimals == null || decimals > 18) return;

    // Scale down by the decimals of the currency token
    const unscaledBalance = BigInt(scaledBalance) / BigInt(10 ** (18 - decimals));

    // Add the balance to the TVL
    api.add(loan.currencyToken, unscaledBalance);
  });

  // USDai borrowed out through escrow timelock
  const escrowTimelockTotalDeposits = await api.call({
    target: ESCROW_TIMELOCK_CONTRACT,
    abi: abi.escrowTimelockTotalDeposits,
  })
  api.add(USDAI_CONTRACT, escrowTimelockTotalDeposits);
}

module.exports = {
  arbitrum: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL is calculated by summing the value of tokens held by the protocol and outstanding claimable yield.",
  hallmarks: [
    ["2025-09-12", "Deposit Caps raised to $250M"],
    ["2025-09-26", "Deposit Caps raised to $500M"]
  ],
};
