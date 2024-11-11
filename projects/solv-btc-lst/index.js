const { getConfig } = require("../helper/cache");
const { sumTokens2, } = require("../helper/unwrapLPs");
const { sumTokens } = require('../helper/chain/bitcoin');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const solvbtclstListUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/main/solvbtc-lst.json';

async function bitcoinTvl() {
  return sumTokens({ owners: await bitcoinAddressBook.solvBTC() })
}

async function tvl(api) {
  let solvbtclst = (await getConfig('solv-protocol/solv-btc-lst', solvbtclstListUrl));

  await otherDeposit(api, solvbtclst);
}

async function otherDeposit(api, solvbtclst) {
  if (!solvbtclst[api.chain] || !solvbtclst[api.chain]["otherDeposit"]) {
    return;
  }
  let otherDeposit = solvbtclst[api.chain]["otherDeposit"];
  let tokensAndOwners = []
  for (const deposit of otherDeposit["depositAddress"]) {
    for (const tokenAddress of otherDeposit["tokens"]) {
      tokensAndOwners.push([tokenAddress, deposit])
    }
  }

  await sumTokens2({ api, tokensAndOwners, permitFailure: true });
}

['bitcoin', 'ethereum'].forEach(chain => {
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

module.exports.methodology = 'Staked tokens via Babylon and Core are counted towards TVL, as they represent the underlying BTC assets securing their respective networks.'
module.exports.doublecounted = false
