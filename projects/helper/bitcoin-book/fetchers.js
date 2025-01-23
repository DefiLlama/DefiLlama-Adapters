const { getConfig, getCache, setCache, } = require('../cache')
const axios = require('axios');
const { getEnv } = require('../env')
const { get } = require('../http')
const sdk = require('@defillama/sdk')

const abi = { getQualifiedUserInfo: 'function getQualifiedUserInfo(address _user) view returns ((bool locked, string depositAddress, string withdrawalAddress) info)' }

module.exports = {
  btcfi_cdp: async () => {
    const target = "0x0000000000000000000000000000000000000100";
    const api = new sdk.ChainApi({ chain: 'bfc' })
    const round = await api.call({  abi: 'uint32:current_round', target})

    const utxoVault = await api.call({ abi: 'function registration_info(address target, uint32 pool_round) view returns (address, string, string, address[], bytes[])', target, params: [target, round] })
    const vault = await api.call({ abi: 'function vault_addresses(uint32 pool_round) view returns (string[])', target, params: round });
    vault.push(utxoVault[2])

    return vault
  },
  bedrock: async () => {
    const API_URL = 'https://raw.githubusercontent.com/Bedrock-Technology/uniBTC/refs/heads/main/data/tvl/reserve_address.json'
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
    return Array.from(new Set(staticAddresses))
  },

  b14g: async () => {

    return getConfig('b14g/bit-addresses', undefined, {
      fetcher: async () => {
        const btcTxHashLockApi = 'https://api.b14g.xyz/restake/marketplace/defillama/btc-tx-hash'
        const { data: { result } } = await get(btcTxHashLockApi)
        const hashes = result.map(r => r.txHash)
        const hashMap = await getCache('b14g/hash-map', 'core',) ?? {}
        for (const hash of hashes) {
          if (hashMap[hash]) continue;
          const addresses = []
          const tx = await get(`https://mempool.space/api/tx/${reserveBytes(hash.slice(2))}`)
          let vinAddress = tx.vin.map(el => el.prevout.scriptpubkey_address);
          tx.vout.forEach(el => {
            if (el.scriptpubkey_type !== "op_return" && !vinAddress.includes(el.scriptpubkey_address)) {
              addresses.push(el.scriptpubkey_address)
            }
          })
          hashMap[hash] = addresses
        }
        await setCache('b14g/hash-map', 'core', hashMap)
        return [...new Set(Object.values(hashMap).flat())]
      }
    })

    function reserveBytes(txHashTemp) {
      let txHash = ''
      if (txHashTemp.length % 2 === 1) {
        txHashTemp = '0' + txHashTemp
      }
      txHashTemp = txHashTemp.split('').reverse().join('')
      for (let i = 0; i < txHashTemp.length - 1; i += 2) {
        txHash += txHashTemp[i + 1] + txHashTemp[i]
      }
      return txHash
    }
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
    const API_URL = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/bitcoin.json'
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