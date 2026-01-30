const alephium = require('../helper/chain/alephium');
const ADDRESSES = require('../helper/coreAssets.json');
const { get } = require('../helper/http');

const config = {
  linx: "vQcfta4Mm32L7Xsb7tYF2rrR76JWxjNv3oia8GPK6x71",
  nodeApiHost: "https://node.mainnet.alephium.org",
}

const ALPH_TOKEN_ID = '0000000000000000000000000000000000000000000000000000000000000000';
const tokens = {
  [ADDRESSES.alephium.USDT]: {
    cgkey: 'tether',
    decimals: 6,
  },
  [ADDRESSES.alephium.USDC]: {
    cgkey: 'usd-coin',
    decimals: 6,
  },
  [ADDRESSES.alephium.WBTC]: {
    cgkey: 'wrapped-bitcoin',
    decimals: 8,
  },
  [ALPH_TOKEN_ID]: {
    cgkey: 'alephium',
    decimals: 18,
  },
}

const MarketCreatedEventIndex = 4;

const MethodIndexes = {
  Linx: {
    market: 4,
  },
};

async function getEvents(contractAddress, start = 0, limit = 100, group) {
  async function go(start, limit, group, events = []) {
    let endpoint = `${config.nodeApiHost}/events/contract/${contractAddress}?start=${start}&limit=${limit}`;
    if (group !== undefined) {
      endpoint += `&group=${group}`;
    }

    const response = await get(endpoint);

    if (response.events.length > 0 && response.nextStart !== undefined) {
      return go(response.nextStart, limit, group, events.concat(response.events));
    } else {
      return events.concat(response.events);
    }
  }
  return go(start, limit, group);
}

async function getMarkets() {
  const events = await getEvents(config.linx, 0);
  let markets = events.filter(e => e.eventIndex === MarketCreatedEventIndex).map(event => {
    const marketId = event.fields[0].value;
    const contractId = event.fields[1].value;
    const loanTokenId = event.fields[2].value;
    const collateralTokenId = event.fields[3].value;

    return { marketId, contractId, loanTokenId, collateralTokenId };
  });

  markets = Array.from(new Map(markets.map(m => [m.marketId, m])).values());
  return markets;
}

async function getLockedCollateral(marketContractId, collateralTokenId) {
  const contractAddress = alephium.addressFromContractId(marketContractId);
  if (collateralTokenId === ALPH_TOKEN_ID) {
    return BigInt((await alephium.getAlphBalance(contractAddress)).balance);
  } else {
    const tokensBalance = await alephium.getTokensBalance(contractAddress);
    const tokenBalance = tokensBalance.find(b => b.tokenId === collateralTokenId);
    return BigInt(tokenBalance?.balance ?? 0);
  }
}

async function getMarketState(marketId) {
  const contractCalls = [
    {
      group: 0,
      address: config.linx,
      methodIndex: MethodIndexes.Linx.market,
      args: [{ type: "ByteVec", value: marketId }]
    }
  ]
  const results = await alephium.contractMultiCall(contractCalls);
  return {
    totalSupplyAssets: BigInt(results[0].returns[0].value),
    totalSupplyShares: BigInt(results[0].returns[1].value),
    totalBorrowAssets: BigInt(results[0].returns[2].value),
    totalBorrowShares: BigInt(results[0].returns[3].value),
    lastUpdate: BigInt(results[0].returns[4].value),
    fee: BigInt(results[0].returns[5].value)
  };
}

async function tvl(api) {
  const markets = await getMarkets();
  const tokenAmounts = new Map();
  for (const market of markets) {
    const state = await getMarketState(market.marketId);
    const supplyAssets = state.totalSupplyAssets;
    const collateral = await getLockedCollateral(market.contractId, market.collateralTokenId);
    tokenAmounts.set(market.collateralTokenId, (tokenAmounts.get(market.collateralTokenId) ?? BigInt(0)) + collateral);
    tokenAmounts.set(market.loanTokenId, (tokenAmounts.get(market.loanTokenId) ?? BigInt(0)) + supplyAssets);
  }

  for (const [tokenId, amount] of tokenAmounts.entries()) {
    if (!tokens[tokenId]) continue;
    const decimals = tokens[tokenId]?.decimals ?? 18;
    const normalizedAmount = Number(amount) / (10 ** decimals);
    api.addCGToken(tokens[tokenId].cgkey, normalizedAmount);
  }
}

module.exports = {
  alephium: {
    tvl
  }
};