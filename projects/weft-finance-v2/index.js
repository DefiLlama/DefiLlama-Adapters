const ADDRESSES = require('../helper/coreAssets.json')
const { post } = require('../helper/http')

const { sumTokens } = require('../helper/chain/radixdlt');

const KEY_VALUE_STORE_URL = `https://mainnet.radixdlt.com/state/key-value-store/`

const lendingPool = 'component_rdx1czmr02yl4da709ceftnm9dnmag7rthu0tu78wmtsn5us9j02d9d0xn'

const lendingMarket = 'component_rdx1cpy6putj5p7937clqgcgutza7k53zpha039n9u5hkk0ahh4stdmq4w'

const resourcePoolsKVS = 'internal_keyvaluestore_rdx1kzjr763caq96j0kv883vy8gnf3jvrrp7dfm9zr5n0akryvzsxvyujc'

async function tvl(api) {
  return sumTokens({ owners: [lendingPool, lendingMarket], api, transformLSU: true });
}

async function borrowed(api) {

  let keys = (await post(`${KEY_VALUE_STORE_URL}/keys`, { "key_value_store_address": resourcePoolsKVS })).items.map(i => ({ key_hex: i.key.raw_hex }))

  let data = (await post(`${KEY_VALUE_STORE_URL}/data`, { "key_value_store_address": resourcePoolsKVS, "keys": keys })).entries.map(i => ([i.key.programmatic_json.value, i.value.programmatic_json.fields]))

  data.forEach(([key, fields]) => {

    let totalLoan = fields[6].fields[1].value

    api.add(key, +totalLoan)

  });

}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false,
};
