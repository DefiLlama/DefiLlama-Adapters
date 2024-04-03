const { sumTokensExport } = require('./helper/chain/ergo')
const { sumTokensExport: steCardano } = require('./helper/chain/cardano')
const utils = require('./helper/utils');

async function cardanoTVL() {
  let response = await utils.fetchURL('https://analytics-balanced.spectrum.fi/cardano/pools/overview?after=0')
  let data = response.data;
  
  let totalTvl = 0;
  for(let i=0; i<data.length; i++) {
    totalTvl += data[i].tvl;
  }

  return {cardano:totalTvl};
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ergo: {
    tvl: sumTokensExport({ owner: '5vSUZRZbdVbnk4sJWjg2uhL94VZWRg4iatK9VgMChufzUgdihgvhR8yWSUEJKszzV7Vmi6K8hCyKTNhUaiP8p5ko6YEU9yfHpjVuXdQ4i5p4cRCzch6ZiqWrNukYjv7Vs5jvBwqg5hcEJ8u1eerr537YLWUoxxi1M4vQxuaCihzPKMt8NDXP4WcbN6mfNxxLZeGBvsHVvVmina5THaECosCWozKJFBnscjhpr3AJsdaL8evXAvPfEjGhVMoTKXAb2ZGGRmR8g1eZshaHmgTg2imSiaoXU5eiF3HvBnDuawaCtt674ikZ3oZdekqswcVPGMwqqUKVsGY4QuFeQoGwRkMqEYTdV2UDMMsfrjrBYQYKUBFMwsQGMNBL1VoY78aotXzdeqJCBVKbQdD3ZZWvukhSe4xrz8tcF3PoxpysDLt89boMqZJtGEHTV9UBTBEac6sDyQP693qT3nKaErN8TCXrJBUmHPqKozAg9bwxTqMYkpmb9iVKLSoJxG7MjAj72SRbcqQfNCVTztSwN3cRxSrVtz4p87jNFbVtFzhPg7UqDwNFTaasySCqM', })
  },
  cardano: {
    tvl: cardanoTVL,
    // tvl: steCardano({ owner: 'addr1x94ec3t25egvhqy2n265xfhq882jxhkknurfe9ny4rl9k6dj764lvrxdayh2ux30fl0ktuh27csgmpevdu89jlxppvrst84slu'})
  }
}
