const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const { getConfig, cachedGraphQuery } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");

// token list
const tokenListsApiEndpoint = "https://token-list.solv.finance/vouchers-prod.json"

// The Graph
const graphUrlList = {
  ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/v0.0.1',
  bsc: 'https://api.thegraph.com/subgraphs/name/slov-payable/solv-v3-earn-factory',
  arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/v0.0.1',
}

async function tvl() {
  const { api } = arguments[3]
  const chainId = api.getChainId()
  const tokens = await tokenList(chainId);
  await sumTokens2({ api, tokensAndOwners: tokens.map(i => [i.address, i.pool]), ignoreFailed: true })
  await graphEarn(api)
}

async function graphEarn(api) {
  const network = api.chain
  if (!graphUrlList[network]) return;
  const slots = await getSlot(api.timestamp, network);

  const concretes = await concrete(slots, api);

  const totalValues = await api.multiCall({
    abi: abi.slotTotalValue,
    calls: slots.map((index) => ({
      target: concretes[index.contractAddress],
      params: [index.slot]
    })),
  })

  const baseInfos = await api.multiCall({
    abi: abi.slotBaseInfo,
    calls: slots.map((index) => ({
      target: concretes[index.contractAddress],
      params: [index.slot]
    })),
  })

  const decimalList = await api.multiCall({
    abi: abi.decimals,
    calls: baseInfos.map(i => i[1]),
  })

  for (let i = 0; i < totalValues.length; i++) {
    const decimals = decimalList[i];
    const balance = BigNumber(totalValues[i]).div(BigNumber(10).pow(18 - decimals)).toNumber();
    api.add(baseInfos[i][1], balance)
  }
}

async function tokenList(chainId) {
  let tokens = [];
  const allTokens = (await getConfig('solv-protocol', tokenListsApiEndpoint)).tokens;
  for (let token of allTokens) {
    if (chainId == token.chainId) {
      if (token.extensions.voucher.underlyingToken != undefined) {
        if (token.extensions.voucher.underlyingToken.symbol != "SOLV" && token.extensions.voucher.underlyingToken.symbol.indexOf("_") == -1) {
          tokens.push({
            address: token.extensions.voucher.underlyingToken.address,
            pool: token.extensions.voucher.vestingPool
          })
        }
      }
    }
  }

  return tokens;
}

async function concrete(slots, api) {
  var slotsList = [];
  var only = {};
  for (var i = 0; i < slots.length; i++) {
    if (!only[slots[i].contractAddress]) {
      slotsList.push(slots[i]);
      only[slots[i].contractAddress] = true;
    }
  }

  const concreteLists = await api.multiCall({
    calls: slotsList.map((index) => index.contractAddress),
    abi: abi.concrete,
  })

  let concretes = {};
  for (var k = 0; k < concreteLists.length; k++) {
    concretes[slotsList[k].contractAddress] = concreteLists[k];
  }

  return concretes;
}


async function getSlot(timestamp, chain) {
  const slotDataQuery = `query BondSlotInfos {
            bondSlotInfos(first: 1000, where:{maturity_gt:${timestamp}}) {
                contractAddress
                slot
            }
        }`;
  const slots = (await cachedGraphQuery(`solv-protocol/graph-data/${chain}`, graphUrlList[chain], slotDataQuery)).bondSlotInfos;
  return slots;
}

['ethereum', 'bsc', 'polygon', 'arbitrum'].forEach(chain => {
  module.exports[chain] = { tvl }
})