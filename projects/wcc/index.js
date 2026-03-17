const { get } = require('../helper/http')

const BASE_URL = 'https://lighthouse.cantonloop.com/api/parties/'
const parties = ['vault0::12202c5d1340647acba2319bdc7785ec0af36affaf2f9318fde769690ddb91927acd','fee0::122047ae202c04cc73d5e928d731e4a025128c60f59e5a7597558fc6a5b6b733eb04']

async function tvl(api){
    for (const party of parties) {
        const { balance } = await get(BASE_URL + party + '/balance')
        api.addCGToken('canton-network', Number(balance.total_coin_holdings))
    }
}

module.exports = {
  canton: { tvl },
  methodology: `TVL is the total CC balance held by custody parties on Canton Network.`,
};