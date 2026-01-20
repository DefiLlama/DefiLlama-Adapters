const { get } = require("../helper/http");
const url = "https://knit-admin.herokuapp.com/api/public/tvl/";

const chainConfig = {
  bsc: "bsc",
  polygon: "matic",
  ethereum: "eth",
  heco: "heco",
  fantom: "fantom",
  avax: "avalanche",
  kcc: "kcc",
  harmony: "harmony",
  okexchain: "okexchain",
  syscoin: "syscoin",
  telos: "telos",
  moonriver: "moonriver",
  milkomeda: "milkomeda",
  moonbeam: "moonbeam",
  bitgert: "bitgert",
  xdai: "gnosis",
  reef: "reef",
  kava: "kava"
};

const tokenMapping = {
  bsc: {
    '0xb2a04c839b9f91889f333e661c9c51deaa6e642d': { geckoId: 'dash'},
    '0x28cf5786dbc2e9ecc1e5b8fd8a2fce005f095c06': { geckoId: 'ripple'},
    '0xf3e94c72889afba13ba53898d22717821883e1a5': { geckoId: 'stellar'},
  },
  polygon: {
    '0x9485adfdcd26f56f9b55ce189905b27845558850': { geckoId: 'matic-network'},
    '0x96729c6de16693d9c9b2013e22842e3eadcffe31': { geckoId: 'ripple'},
    '0x03c8fb4716ab826041e6d447c0b3916feeefadfe': { geckoId: 'stellar'},
  },
  fantom: {
    '0xaafc50ac5c03555085f555a2b7c139b6ee058ca2': { geckoId: 'ripple'},
    '0xe401744b34f44ceefcfa2ba66eae9f1e448f0bd6': { geckoId: 'stellar'},
  },
}

const blacklist = [
  '0xef53462838000184f35f7d991452e5f25110b207',
]

module.exports = {
  timetravel: false,
};

function addChain(chain) {
  module.exports.deadFrom = "2023-02-01"
  module.exports[chain] = {
    tvl: async (api) => {
      const key = chainConfig[chain];
      const mapping = tokenMapping[chain] || {}
      let response = await get(url + key);
      for (const info of response.data.data.info) {
        let token = info.address
        let bal = info.balance
        if (+info.balance > 0 && !blacklist.includes(token)) {
          token = token.toLowerCase()
          if (mapping[token]) {
            bal /= 10 ** (mapping[token].decimals || 18)
            token = mapping[token].geckoId
          }
          api.add(token, bal)
        }
      }
    },
  };
}

Object.keys(chainConfig).map(addChain);
