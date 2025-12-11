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
    const round = await api.call({ abi: 'uint32:current_round', target })

    const utxoVault = await api.call({ abi: 'function registration_info(address target, uint32 pool_round) view returns (address, string, string, address[], bytes[])', target, params: [target, round] })
    const vault = await api.call({ abi: 'function vault_addresses(uint32 pool_round) view returns (string[])', target, params: round });
    vault.push(utxoVault[2])

    return vault
  },
  bedrock: async () => {
    const API_URL = 'https://bedrock-datacenter.rockx.com/data/tvl/reserve_address.json'
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
        const btcInCorechainTxHashLockApi = 'https://api.b14g.xyz/restake/marketplace/defillama/btc-tx-hash'
        const { data: { result } } = await get(btcInCorechainTxHashLockApi)
        const btcInBabylonGenesisTxHashLockApi = 'https://api.b14g.xyz/babylon-costaking/order/defillama/btc-tx-hash'
        const resultInBabylonGenesis = await get(btcInBabylonGenesisTxHashLockApi)

        const hashes = result.map(r => r.txHash).concat(resultInBabylonGenesis.map(r => r.txHash))
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
  coffernetwork: async () => {

    return getConfig('coffer-network-v0.1', undefined, {
      fetcher: async () => {
        const { data: { addresses, } } = await get('https://aapi.coffer.network/v1/stats/addresses?network=mainnet')
        return addresses
      }
    })
  },

  lombard: async () => {
    const API_URL = 'https://mainnet.prod.lombard.finance/api/v1/addresses'
    const BATCH_SIZE = 1000
    const blacklisted = new Set([ // blacklisted addresses , using the corresponding amount in LFBTC here 0x838f0c257ab27856ee9be57f776b186140834b58 , token : 0xfe4ecd930a1282325aef8e946f17c0e25744de45
      'bc1phz9f27wshtset37f96xl266w9zaq0wdmls749qad2rj3zz4zc8psmgts3w',
      'bc1pkzlqekjjylsrt9eh57pcd8ynz5w4jv6k3wlj39x8y59fhm4pjdxs9xvs46',
      'bc1pntj998mddtc4ketfvh8jhvn4tgrvv5870hsfpwhttxwtgv4mrvmqmr6s3f',
      'bc1pt3rf4ml95sfc8svqjtl8d6h5hjkej60ruvtfry44g35uchjt2seqxx7tfm',
      'bc1pwffr0etqcg3awczl6lfs4dne987y64rgnnael577yj02jvuvnrssqyxdsj',
    ])

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

        return allAddresses.filter(i => !blacklisted.has(i))
      }
    })
  },
  solvBTCLST: async () => {
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
    // return [
    //   "bc1qr5laxd2pyptae847tt32qddujtws305s8ej278",
    //   "bc1qwetfspn7fp4dgsh44y4dzwx5y8e3tlc7v0mhf5",
    //   "bc1qprkyx79jxvpe69mewfmlat8ydavuth95ppec5m",
    //   "bc1q63r464arzp9709tqc2z3hkmcna0lrmzv7sekl5",
    //   "bc1q0w68p8gh5egxjjd9edlyqkncns7veexcurqut9",
    //   "bc1qlgtalpnsfqsc6wxdm6uvjjdd9ujgq0a8x4yslh",
    //   "bc1qpdx8zrkjsjd8mjhaznnz0atz6v9f2upda9xgyn",
    //   "bc1qtd8mplu4n7evnmzqtrtt7ljs0rl00th42kcgj5",
    //   "bc1qyghykrhmkk5ztn4l5pjaqywpsxkg6e9rdm22mt",
    //   "bc1q04phgdeyx7nneh2ux4ynxhew4vwqfduk3wt6hc"
    // ]
    const API_URL = 'https://api.tbtcscan.com/tbtc/proof-of-funds'
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
  },
  dlcLink: async () => {
    const config = await getConfig('dlc-link', 'https://api.dlc.link/v1/ibtc/proof-of-reserve')
    const addresses = []
    config.chains.forEach(c => {
      addresses.push(...(c.vaultAddresses ?? []))
    })
    return addresses
  },
  solvBTC: async () => {
    const API_URL = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solvbtc.json'
    const res = await getConfig('solv-protocol/solv-btc-non-lst', API_URL)
    return res.bitcoin
  },

  btnx: async () => {
    const staticAddresses = await getConfig('btnx', undefined, {
      fetcher: async () => {
        const { data } = await axios.get('https://sidecar.botanixlabs.com/api/addressList', {
        })
        return data.map(address => address)
      }
    })

    return Array.from(new Set(staticAddresses))
  },
  zeusZBTC: async () => {
    const API_URL = 'https://indexer.zeuslayer.io/api/v2/chainlink/proof-of-reserves'
    const data = await getConfig('zeus/zbtc', API_URL)
    const list = data.result.map(item => item.address)
    return list
  },
  binanceFetcher: async () => {
    const staticAddresses = await getConfig('binance-cex/btc', undefined, {
      fetcher: async () => {
        const { data } = await axios.get('https://www.binance.com/bapi/apex/v1/public/apex/market/por/address')
        return data.data.filter(i => i.network === 'BTC').map(item => item.address)
      }
    })
    return Array.from(new Set(staticAddresses))
  },
  vishwa: async () => {
    const staticAddresses = await getConfig('vishwa', undefined, {
      fetcher: async () => {
        const { data } = await axios.get('https://api.btcvc.vishwanetwork.xyz/btc/address')
        return data.data
      }
    })
    return Array.from(new Set(staticAddresses))
  },
  yala: async () => {
    const staticAddresses = await getConfig('yala/bitcoin', undefined, {
      fetcher: async () => {
        const { data } = await axios.get('https://raw.githubusercontent.com/yalaorg/yala-defillama/refs/heads/main/config.json')
        return data.bitcoin
      }
    })
    return Array.from(new Set(staticAddresses))
  },
  zenrock: async () => {
    const ZRCHAIN_WALLETS_API = 'https://api.diamond.zenrocklabs.io/zrchain/treasury/zenbtc_wallets';
    const ZENBTC_PARAMS_API = 'https://api.diamond.zenrocklabs.io/zenbtc/params';
    const ZRCHAIN_KEY_BY_ID_API = 'https://api.diamond.zenrocklabs.io/zrchain/treasury/key_by_id';

    // Always use latest addresses since wallets are only added, never removed.
    // The balance checker will use the historical timestamp to get correct balances.
    return getConfig('zenrock/addresses', undefined, {
      fetcher: async () => {
        async function getBitcoinAddresses() {
          const btcAddresses = [];
          let nextKey = null;

          while (true) {
            let url = ZRCHAIN_WALLETS_API;
            if (nextKey) {
              url += `?pagination.key=${encodeURIComponent(nextKey)}`;
            }
            const data = await get(url);
            if (data.zenbtc_wallets && Array.isArray(data.zenbtc_wallets)) {
              for (const walletGroup of data.zenbtc_wallets) {
                if (walletGroup.wallets && Array.isArray(walletGroup.wallets)) {
                  for (const wallet of walletGroup.wallets) {
                    if (wallet.type === 'WALLET_TYPE_BTC_MAINNET' && wallet.address) {
                      btcAddresses.push(wallet.address);
                    }
                  }
                }
              }
            }
            if (data.pagination && data.pagination.next_key) {
              nextKey = data.pagination.next_key;
            } else {
              break;
            }
          }
          return btcAddresses;
        }

        async function getChangeAddresses() {
          const paramsData = await get(ZENBTC_PARAMS_API);
          if (!paramsData?.params?.changeAddressKeyIDs) {
            return [];
          }
          const changeAddresses = [];
          for (const keyID of paramsData.params.changeAddressKeyIDs) {
            const keyData = await get(`${ZRCHAIN_KEY_BY_ID_API}/${keyID}/WALLET_TYPE_BTC_MAINNET/`);
            if (keyData.wallets && Array.isArray(keyData.wallets)) {
              for (const wallet of keyData.wallets) {
                if (wallet.type === 'WALLET_TYPE_BTC_MAINNET' && wallet.address) {
                  changeAddresses.push(wallet.address);
                }
              }
            }
          }
          return changeAddresses;
        }

        const [btcAddresses, changeAddresses] = await Promise.all([
          getBitcoinAddresses(),
          getChangeAddresses(),
        ]);
        const allAddresses = [...btcAddresses, ...changeAddresses];
        return allAddresses;
      }
    });
  },
}
