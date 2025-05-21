const { getConfig } = require("../helper/cache");
const { sumTokens2, } = require("../helper/unwrapLPs");
const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const solvbtcListUrl = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solvbtc.json';

async function bitcoinTvl() {
  return sumTokens({ owners: await bitcoinAddressBook.solvBTC() })
}

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
['bitcoin', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'mantle', 'merlin', 'avax', 'bob', 'base'].forEach(chain => {
  if (chain == 'bitcoin') {
    module.exports[chain] = {
      tvl: bitcoinTvl,
    }
  } else {
    module.exports[chain] = {
      tvl
    }
  }
})
