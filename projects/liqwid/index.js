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
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmj3z228hznt0rz2enxfzhtk2270gels0ht9uvf9wmyxs99qsgwdnc",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmhccartl0f44hvc4vq8n3042epqvqq8cd4g9znpl5kdeypsx0m4jt",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmh0sfgalgyvgedlnhfl7u2059dkyhp453hm86797rm5qhasum9d4l",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vm43q9zvxe5ehfytyye9m3dq3knvuz2fdnax7lhhjm4vvjgq8wmp5z",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmjypq27sagqxt4jwt57mdsef3zu65ng4zmzxaa246s97nxsk5pksg",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmsfpkhcpsthxpprf49lvfy2jhga5mygpfcj4qaypfzkmhnskrm6uv",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmja0x7l0scsd0wvfm3ljugdpsu4kctwfjyud65xfeht5uyqmfjy8x",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmk0l2wkhq0pr72jsdrv2kn8v3pqnrt0qykpq9fwr2wn0czsklm7ad",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmhnschmu7dwefmhkd078735ucq2yh90ylkzxrenz9cy8udsfw6k4m",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmnupshega3f5ym0freunp0p46rchpthvsyty398fh0msywsxgwa75",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vm3lzwuv27k9keyjpag32pmx9mf63tn77feppvm7d0s5ndnsqdv78z",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmhwdw2g8sat0hr2pdt2ct27n33z0w6dzsfy684ut24gjfsq2qynek",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmnys5sq3xea3866499dczkshygljanhepcqjfwyhe3fpads9jkkqh",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmjs80extwffmz4yagvdxvr6cpd8nm3qne020739j706h3jqgthhnc",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vmk8jkqyfeeuz5m6sfv27g9vav8w83lsaqewjqxnpnpjd9wsr4swv0",
        "addr1x97atw4jlfulpp73agh4hav2nfwlcwcfqcgr9mpucde9vm3saw6lwmnlk6z0aehzea9nwfvdvang9v42yylt83ym8zqqm5074y",
        "addr1vxcl9us2s7q68w5k0kx8k5rg6gwhn85qnhxwytm9zeuavcgte4yd6",
      ]
    }),
    methodology: 'Adds up the Ada in the 16 action tokens and batch final token.'
  }
};
