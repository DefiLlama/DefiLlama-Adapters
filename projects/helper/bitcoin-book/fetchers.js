const { getConfig } = require('../cache')
const axios = require('axios');
const { getEnv } = require('../env')
const { get } = require('../http')
const sdk = require('@defillama/sdk')

module.exports = {
  bedrock: async () => {
    const API_URL = 'https://bedrock-datacenter.rockx.com/uniBTC/reserve/address'
    const { btc } = await getConfig('bedrock.btc_address', API_URL)
    return btc
  },
  exsatCreditStaking: async () => {
    const { data: response } = await axios.post('https://rpc-us.exsat.network/v1/chain/get_table_rows', {
      json: true,
      code: "custody.xsat",
      scope: "custody.xsat",
      table: "custodies",
      limit: "100",
      show_payer: true
    })
    return response.rows.map(row => row.data.btc_address);
  },
  fbtc: async () => {
    return getConfig('fbtc', undefined, {
      fetcher: async () => {
        const token = getEnv('FBTC_ACCESS_TOKEN')
        const { result } = await get('https://fbtc.phalcon.blocksec.com/api/v1/extension/fbtc-reserved-addr', {
          headers: {
            'access-token': token
          }
        })
        return result.map(r => r.address)
      }
    })
  },
  lombard: async () => {
    const API_URL = 'https://mainnet.prod.lombard.finance/api/v1/addresses'
    const BATCH_SIZE = 1000

    return getConfig('lombard', undefined, {
      fetcher: async () => {
        let allAddresses = [];
        let offset = 0;
        let batchNumber = 1;
        let hasMore = true;
      
        while (hasMore) {
          const { addresses: data, has_more } = await get(`${API_URL}?limit=${BATCH_SIZE}&offset=${offset}`);
          const newAddresses = data.map(a => a.btc_address);
          
          allAddresses.push(...newAddresses);
          sdk.log(`Batch ${batchNumber} completed: ${newAddresses.length} addresses`);
      
          hasMore = has_more;
          offset += BATCH_SIZE;
          batchNumber++;
        }
        
        return allAddresses;
      }
    })
  },
  solvBTC: async () => {
    const API_URL = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/refs/heads/main/bitcoin.json'
    return Object.values(await getConfig('solv-protocol/solv-btc-lst', API_URL)).flat();
  }
}