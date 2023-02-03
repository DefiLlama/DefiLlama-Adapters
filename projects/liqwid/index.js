const { GraphQLClient, } = require('graphql-request')
const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

async function _tvl() {
    var endpoint = 'https://api.liqwiddev.net/graphql'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = ` {
      markets {
        totalSupply
        marketId
    }
   } `;
    var results = await graphQLClient.request(query)
    return {cardano:results.markets.find(i => i.marketId === 'Ada').totalSupply / 1e6}
}

module.exports = {
  cardano: {
    tvl: sumTokensExport({
      tokens: [nullAddress],
      owners: [
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuy63z228hznt0rz2enxfzhtk2270gels0ht9uvf9wmyxs99quh3xsg",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuya3q9zvxe5ehfytyye9m3dq3knvuz2fdnax7lhhjm4vvjgqt3y2hj",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuyl0sfgalgyvgedlnhfl7u2059dkyhp453hm86797rm5qhassy6xk0",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuycfpkhcpsthxpprf49lvfy2jhga5mygpfcj4qaypfzkmhns6uy3lu",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuylccartl0f44hvc4vq8n3042epqvqq8cd4g9znpl5kdeyps2sy73m",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuy6s80extwffmz4yagvdxvr6cpd8nm3qne020739j706h3jqy5gusg",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuylwdw2g8sat0hr2pdt2ct27n33z0w6dzsfy684ut24gjfsqxlmc6x",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuy78jkqyfeeuz5m6sfv27g9vav8w83lsaqewjqxnpnpjd9ws02090l",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuy6a0x7l0scsd0wvfm3ljugdpsu4kctwfjyud65xfeht5uyqhkd0yk",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuylnschmu7dwefmhkd078735ucq2yh90ylkzxrenz9cy8uds939akt",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuy70l2wkhq0pr72jsdrv2kn8v3pqnrt0qykpq9fwr2wn0czs6qy47a",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuymupshega3f5ym0freunp0p46rchpthvsyty398fh0msyws2h3kay",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuyelzwuv27k9keyjpag32pmx9mf63tn77feppvm7d0s5ndnsvjn4yj",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuyesaw6lwmnlk6z0aehzea9nwfvdvang9v42yylt83ym8zqqhts4k5",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuy6ypq27sagqxt4jwt57mdsef3zu65ng4zmzxaa246s97nxs6t7anc",
        "addr1xy865neqh8vpqgzl3x6z39hxj0lu38p7un3s0a8s5jynuymys5sq3xea3866499dczkshygljanhepcqjfwyhe3fpadsfdfar8",
        "addr1w9afj34vc68qdm7heuz7esmr8sj76wpa45t7dh3ag8xpplgml3zuk",
      ]
    }),
    methodology: 'Adds up the Ada in the 16 action tokens and batch final token.'
  }
};
