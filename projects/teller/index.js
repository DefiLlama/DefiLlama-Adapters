const { gql, request } = require("graphql-request");
const sdk = require("@defillama/sdk");

const SUBGRAPHS = {
  teller: {
    ethereum: sdk.graph.modifyEndpoint("B6FW3z7yLTJKVuqz6kLDJAwJru1T89j4ww5JfY3GYX8F"),
    base: sdk.graph.modifyEndpoint("ArZjkaosc5rmBoYqprFWomvnjKSFMGkPFD7yuaZGuqQo"),
    arbitrum: sdk.graph.modifyEndpoint("F2Cgx4q4ATiopuZ13nr1EMKmZXwfAdevF3EujqfayK7a"),
    katana: sdk.graph.modifyEndpoint("https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-v2-katana/0.4.21.5/gn"),
  },
  pools: {
    v1: {
      ethereum: "https://ethereum-mainnet.graph-eu.p2pify.com/8614c21e12ec31df6366661570265a0b/sgr-520-422-765",
      base: "https://base-mainnet.graph-eu.p2pify.com/6597d6ea90c8f7590fa0d7ca2437b00a/sgr-204-614-601",
      arbitrum: "https://arbitrum-mainnet.graph-eu.p2pify.com/931a3372bc471da17f3c37b51c71103f/sgr-821-576-009",
    },
    v2: {
      ethereum: "https://ethereum-mainnet.graph-eu.p2pify.com/53994895745f8cf218288cd21afe14bd/sgr-278-140-260",
      base: "https://base-mainnet.graph-eu.p2pify.com/ee28001bf0cbdbea2ef8eced485e2e28/sgr-955-405-762",
      arbitrum: "https://arbitrum-mainnet.graph-eu.p2pify.com/6d8e738c9fe322e8b5b593f9bcc907cb/sgr-575-510-903",
      katana: "https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-katana/0.4.21.12/gn",
      // hyperevm: "https://api.goldsky.com/api/public/project_cme01oezy1dwd01um5nile55y/subgraphs/teller-pools-v2-hyperevm/0.4.21.11/gn",
    },
  },
};

const Q_BID_COLLATERALS_DEPOSITED = gql`
  query ($skip: Int!) {
    bidCollaterals(first: 1000, skip: $skip, where: { status: "Deposited" }) {
      id
      amount
      collateralAddress
      token { address symbol decimals }
      bid { status }
    }
  }
`;

const Q_BIDS_ACCEPTED = gql`
  query ($skip: Int!) {
    bids(first: 1000, skip: $skip, where: { status: "Accepted" }) {
      id
      bidId
      lendingTokenAddress
      principal
      totalRepaidPrincipal
    }
  }
`;

const Q_POOL_METRICS = gql`
  {
    groupPoolMetrics(first: 1000) {
      id
      group_pool_address
      principal_token_address
      collateral_token_address
      total_principal_tokens_committed
      total_principal_tokens_withdrawn
      total_principal_tokens_borrowed
      total_principal_tokens_repaid
      total_interest_collected
      token_difference_from_liquidations
      total_collateral_tokens_deposited
      total_collateral_tokens_withdrawn
    }
  }
`;

const PAGE_SIZE = 1000;

function getTellerSubgraph(chain) {
  const url = SUBGRAPHS.teller[chain];
  if (!url) throw new Error(`Missing teller subgraph for chain: ${chain}`);
  return url;
}

async function paginateSubgraph({ url, query, extract, variables = {} }) {
  let skip = 0;
  const out = [];

  while (true) {
    const data = await request(url, query, { ...variables, skip });
    const items = extract(data) || [];
    if (!items.length) break;

    out.push(...items);
    if (items.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return out;
}

function toNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toIntString(n) {
  if (!Number.isFinite(n) || n <= 0) return "0";
  return Math.floor(n).toString();
}

async function addBidCollateralTVL(api) {
  const url = getTellerSubgraph(api.chain);

  const collaterals = await paginateSubgraph({ url, query: Q_BID_COLLATERALS_DEPOSITED, extract: (d) => d.bidCollaterals });

  for (const c of collaterals) {
    if (!c?.token?.address) continue;
    api.add(c.token.address, c.amount);
  }
}

async function addPoolsLenderTVL(api) {
  const chain = api.chain;
  const urls = [];

  if (SUBGRAPHS.pools.v1[chain]) urls.push(SUBGRAPHS.pools.v1[chain]);
  if (SUBGRAPHS.pools.v2[chain]) urls.push(SUBGRAPHS.pools.v2[chain]);
  if (!urls.length) return;

  let allPools = [];
  for (const url of urls) {
    const { groupPoolMetrics = [] } = await request(url, Q_POOL_METRICS);
    allPools = allPools.concat(groupPoolMetrics);
  }

  const seen = new Set();
  const uniquePools = [];
  for (const p of allPools) {
    const key = (p.group_pool_address || p.id || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniquePools.push(p);
  }

  for (const p of uniquePools) {
    const totalInterestCollected = Number(p.total_interest_collected || 0);
    const tokenDiffFromLiquidations = Number(p.token_difference_from_liquidations || 0);

    const totalBorrowedNet =
      Number(p.total_principal_tokens_borrowed || 0) -
      Number(p.total_principal_tokens_repaid || 0);

    const totalCommitted =
      Number(p.total_principal_tokens_committed || 0) +
      totalInterestCollected +
      tokenDiffFromLiquidations -
      Number(p.total_principal_tokens_withdrawn || 0);

    let netPrincipalTvl = totalCommitted - totalBorrowedNet;
    if (!(netPrincipalTvl > 0) || !p.principal_token_address) continue;

    const decimals = await api.call({ target: p.principal_token_address, abi: "erc20:decimals" });
    netPrincipalTvl = (netPrincipalTvl / 1e18) * (10 ** Number(decimals));

    api.add(p.principal_token_address, Math.floor(netPrincipalTvl).toString());
  }
}


async function addBorrowed(api) {
  const url = getTellerSubgraph(api.chain);

  const bids = await paginateSubgraph({ url, query: Q_BIDS_ACCEPTED, extract: (d) => d.bids });

  for (const b of bids) {
    const borrowed = toNum(b.principal) - toNum(b.totalRepaidPrincipal);
    if (borrowed > 0 && b.lendingTokenAddress) api.add(b.lendingTokenAddress, toIntString(borrowed));
  }
}

async function tvl(api) {
  throw new Error('Verify if it is subgraph issue')
  await addBidCollateralTVL(api);
  await addPoolsLenderTVL(api);
}

async function borrowed(api) {
  await addBorrowed(api);
}

module.exports.methodology = "To obtain TVL of Synthetify we must add all colaterals which was deposited.";

const CHAINS = ["ethereum", "base", "arbitrum", "katana"];
CHAINS.forEach((chain) => {
  module.exports[chain] = { tvl, borrowed };
});
