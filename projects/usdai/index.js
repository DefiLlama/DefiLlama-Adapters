const abi = {
    "claimableBaseYield": "uint256:claimableBaseYield",
    "pools": "address[]:pools",
    "currencyToken": "address:currencyToken",
    "liquidityNodes": "function liquidityNodes(uint128 startTick, uint128 endTick) view returns (tuple(uint128 tick, uint128 value, uint128 shares, uint128 available, uint128 pending, uint128 redemptions, uint128 prev, uint128 next)[])",
    "whitelistedTokens": "function whitelistedTokens() external view returns (address[] memory)",
    "loanRouterBalances": "function loanRouterBalances() external view returns (uint256, uint256, uint256)",
    "loanState": "function loanState(bytes32 loanTermsHash) external view returns (uint8, uint64, uint64, uint256)"
  };
const { sumTokens2 } = require("../helper/unwrapLPs");
const { gql, request } = require("graphql-request");

// Loan Router Subgraph API
const LOAN_ROUTER_SUBGRAPH_API = 'https://api.goldsky.com/api/public/project_clzibgddg2epg01ze4lq55scx/subgraphs/loan_router_arbitrum/0.0.3/gn';

const USDAI_CONTRACT = "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF";
const STAKED_USDAI_CONTRACT = "0x0B2b2B2076d95dda7817e785989fE353fe955ef9";
const QUEUED_DEPOSITOR_CONTRACT = "0x81cc0DEE5e599784CBB4862c605c7003B0aC5A53";
const LOAN_ROUTER_CONTRACT = "0x0C2ED170F2bB1DF1a44292Ad621B577b3C9597D1";
const WRAPPED_M_CONTRACT = "0x437cc33344a0B27A429f795ff6B469C72698B291";
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const LOAN_TOKENS = [USDC, USDT];
const LEGACY_POOL_1 = "0x0f62b8C58E1039F246d69bA2215ad5bF0D2Bb867";
const LEGACY_POOL_2 = "0xcd9d510c4e2fe45e6ed4fe8a3a30eeef3830cc14";
const LEGACY_POOLS = [LEGACY_POOL_1, LEGACY_POOL_2];
const MAX_UINT_128 = "0xffffffffffffffffffffffffffffffff";
const loanHashesQuery = gql`
  query GetLoanHashes($timestampLte: String!) {
    loanRouterEvents(
      where: { 
        type: LoanOriginated,
        timestamp_lte: $timestampLte
      }
      orderBy: timestamp
      orderDirection: desc
    ) {
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

async function tvl(api) {
  // Get wrapped M tokens in USDai
  const wrappedMBalanceInUsdai = await api.call({
    target: WRAPPED_M_CONTRACT,
    abi: 'erc20:balanceOf',
    params: [USDAI_CONTRACT],
  })

  // Add wrapped M balance in USDai
  api.add(WRAPPED_M_CONTRACT, wrappedMBalanceInUsdai);

  // Get wrapped M tokens in Staked USDai
  const wrappedMBalanceInStakedUsdai = await api.call({
      target: WRAPPED_M_CONTRACT,
      abi: 'erc20:balanceOf',
      params: [STAKED_USDAI_CONTRACT],
  })
  
  // Add wrapped M balance in Staked USDai
  api.add(WRAPPED_M_CONTRACT, wrappedMBalanceInStakedUsdai);

  // Immediately claimable wrapped M tokens
  const claimableWrappedM = await api.call({
    target: STAKED_USDAI_CONTRACT,
    abi: abi.claimableBaseYield // return value is scaled up by 10^12
  }) / 10 ** 12; // scale down by 10^12 to match the decimals of the wrapped M token

  // Add claimable wrapped M tokens
  api.add(WRAPPED_M_CONTRACT, claimableWrappedM)

  // Get loan repayment balances in Staked USDai
  await sumTokens2({
    api,
    owner: STAKED_USDAI_CONTRACT, 
    tokens: LOAN_TOKENS,
    permitFailure: true,
  })

  // Add tokens held by the queued depositor  
  const whitelistedTokens = await api.call({
    target: QUEUED_DEPOSITOR_CONTRACT,
    abi: abi.whitelistedTokens,
  });
  await sumTokens2({
    api,
    owner: QUEUED_DEPOSITOR_CONTRACT, 
    tokens: whitelistedTokens,
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
      const scalingFactor = 10 ** (18 - decimals);

      return liquidityNodes.reduce((partialSum, node) => {
        const scaledValue = (+node.value - +node.available) / scalingFactor;
        return partialSum + scaledValue;
      }, 0);
    });
    api.addTokens(tokens, poolsBorrowedValue);

    // Loan router borrowed
    const { loanRouterEvents } = await request(LOAN_ROUTER_SUBGRAPH_API, loanHashesQuery, {
      timestampLte: String(api.timestamp),
    });
    for (const event of loanRouterEvents) {
      // Get the currency token
      const { currencyToken } = event.loanOriginated;
    
      // Get scaled balance
      const [status, , , scaledBalance] = await api.call({ abi: abi.loanState, target: LOAN_ROUTER_CONTRACT, params: [event.loanTermsHash] });

      // If the loan is inactive, continue
      if (status !== "1") continue;

      // Scale down by the decimals of the currency token
      const unscaledBalance = scaledBalance / 10 ** (18 - currencyToken.decimals);

      // Add the balance to the TVL
      api.add(currencyToken.id, unscaledBalance);
    }
}

module.exports = {
  arbitrum: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL is calculated by summing the value of tokens held by the protocol and outstanding immediately claimable yield.",
  hallmarks: [
    [1757548800, "Deposit Caps raised to $250M"],
    [1758758400, "Deposit Caps raised to $500M"]
  ],
};
