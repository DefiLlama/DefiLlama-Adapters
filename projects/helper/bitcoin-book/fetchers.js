const { getConfig } = require('../cache')
const axios = require('axios');
const { getEnv } = require('../env')
const { get } = require('../http')
const sdk = require('@defillama/sdk')

const abi = { getQualifiedUserInfo: 'function getQualifiedUserInfo(address _user) view returns ((bool locked, string depositAddress, string withdrawalAddress) info)' }

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
    const api = new sdk.ChainApi({ chain: 'ethereum' })
    const staticAddresses = await getConfig('fbtc', undefined, {
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

    const users = await api.call({ abi: 'address[]:getQualifiedUsers', target: '0xbee335BB44e75C4794a0b9B54E8027b111395943' })
    const userInfos = await api.multiCall({ abi: abi.getQualifiedUserInfo, target: '0xbee335BB44e75C4794a0b9B54E8027b111395943', calls: users })
    userInfos.forEach(i => staticAddresses.push(i.depositAddress))
    return staticAddresses
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
  },
  pumpBTC: async () => {
    const API_URL = 'https://dashboard.pumpbtc.xyz/api/dashboard/asset/tokenowners'
    return getConfig('pumpbtc/v2', undefined, {
      fetcher: async () => {
        const { data } = await axios.get(API_URL)
        return data.data.bitcoin.owners
      }
    })
  },
  tBTC: async () => {
    const API_URL = 'https://api.threshold.network/tbtc/wallets/pof'
    const { wallets } = await getConfig('tbtc/wallets', API_URL)
    return wallets.filter(i => +i.walletBitcoinBalance > 0).map(wallet => wallet.walletBitcoinAddress)
  },
  exsatBridge: async () => {
    const API_URL = 'https://raw.githubusercontent.com/exsat-network/exsat-defillama/refs/heads/main/bridge-bitcoin.json'
    const API2_URL = 'https://rpc-us.exsat.network/v1/chain/get_table_rows'

    const config = await getConfig('exsat', API_URL)
    const custody_addresses = config['custody_addresses'];
    const custody_ids = config['custody_ids'];
    const owners = [...custody_addresses];

    for (let custody_id of custody_ids) {
      let lower_bound = null;
      let hasMore = true;

      while (hasMore) {
          const { data: response } = await axios.post(API2_URL, {
              "json": true,
              "code": "brdgmng.xsat",
              "scope": custody_id,
              "table": "addrmappings",
              "lower_bound": lower_bound,
              "upper_bound": null,
              "index_position": 1,
              "key_type": "",
              "limit": "100",
              "reverse": false,
              "show_payer": true
          });

          const addrs = response.rows.map(row => row.data.btc_address);
          owners.push(...addrs);

          hasMore = response.more;
          lower_bound = response.next_key;
      }
    }
    return owners
  }
}