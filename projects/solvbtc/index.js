const abi = require("./abi.json");
const sdk = require('@defillama/sdk');
const { getConfig } = require("../helper/cache");
const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require("../helper/unwrapLPs");
const { sumTokensExport, } = require('../helper/sumTokens');

// The Graph
const graphUrlList = {
  ethereum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-prod/version/latest',
  bsc: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-bsc/version/latest',
  arbitrum: 'https://api.studio.thegraph.com/query/40045/solv-payable-factory-arbitrum/version/latest',
  mantle: 'https://api.0xgraph.xyz/api/public/65c5cf65-bd77-4da0-b41c-cb6d237e7e2f/subgraphs/solv-payable-factory-mantle/-/gn',
  merlin: 'http://solv-subgraph-server-alb-694489734.us-west-1.elb.amazonaws.com:8000/subgraphs/name/solv-payable-factory-merlin',
}

const solvbtcListUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/main/solvbtc.json';

const bitcionOwners = [
  'bc1pjrxeuc9f3zqtx92s3mnf6202894jzufswur957l6s04rjns6dumsyh6u89',
  'bc1qdpwl80flfh3k6h6sumzwgws3ephkrmx307hk64'
]

async function tvl(api) {
  let solvbtc = (await getConfig('solv-protocol/solvbtc', solvbtcListUrl));

  await otherDeposit(api, solvbtc);
}

async function otherDeposit(api, solvbtc) {
  if (!solvbtc[api.chain] || !solvbtc[api.chain]["otherDeposit"]) {
    return;
  }
  let otherDeposit = solvbtc[api.chain]["otherDeposit"];

  let tokensAndOwners = []
  for (const deposit of otherDeposit["depositAddress"]) {
    for (const tokenAddress of otherDeposit["tokens"]) {
      tokensAndOwners.push([tokenAddress, deposit])
    }
  }

  await sumTokens2({ api, tokensAndOwners, permitFailure: true });
}

// node test.js projects/solvbtc
['bitcoin', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'mantle', 'merlin'].forEach(chain => {
  if (chain == 'bitcoin') {
    module.exports[chain] = {
      tvl: sumTokensExport({ owners: bitcionOwners }),
    }
  } else {
    module.exports[chain] = {
      tvl
    }
  }
})
