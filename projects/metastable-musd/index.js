const sui = require("../helper/chain/sui");
const http = require('../helper/http');
const { getEnv } = require('../helper/env')

const endpoint = () => getEnv('SUI_RPC')

async function tvl(api) {
  const vaultData = await sui.getObjects(["0xb950819c5eba1bb5980f714f2a3b1d8738e3da58a4d9daf5fa21b6c2a7dd1e12"])

  for (const { fields: { metadata, } } of vaultData) {

    const {
      result: { data: fields }
    } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method: 'suix_getDynamicFields', params: [metadata.fields.id.id , null, 48], })
    const fieldObjects = await sui.getDynamicFieldObjects({
      parent: metadata.fields.id.id 
    })

    let i = 0
    for (const field of fields) {
      
      const coin = field.name.value.name
      const amount = fieldObjects[i].fields.balance
      
      api.add("0x" + coin, amount)
      i++
    }
  }
}

module.exports = {
  timetravel: true,
  sui: {
    tvl,
  },
};
