const { getConfig } = require("../helper/cache");
const { sumTokens2, } = require("../helper/unwrapLPs");
const { sumTokensExport, } = require('../helper/sumTokens');

const solvbtcListUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/main/solvbtc.json';

const bitcionOwners = [
  'bc1pjrxeuc9f3zqtx92s3mnf6202894jzufswur957l6s04rjns6dumsyh6u89',
  'bc1qdpwl80flfh3k6h6sumzwgws3ephkrmx307hk64',
  'bc1q5pzsptd5whcljevzyztavuqru0hugd5ymgx5ezksdqug3ztrjvmqauys2q',
  'bc1q437jw8wqph854vf9dwxy4c2u6daveupjm5dqptj469gxw6vcpp0qfpr0mh',
  'bc1q47ur7u0xh943s44kktvhr602sm29exylzn43ru'
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
