
const MASSET_ABI_V2 = {
  "getBassets": "function getBassets() view returns (tuple(address addr, address integrator, bool hasTxFee, uint8 status)[] personal, tuple(uint128 ratio, uint128 vaultBalance)[] data)"
}

const ASSETS = {
  ethereum: [
    {
      // mUSD
      address: '0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
      startBlock: 10148032,
      isMasset: true,
    },
    {
      // mBTC
      address: '0x945facb997494cc2570096c74b5f66a3507330a1',
      startBlock: 11840521,
      isMasset: true,
    },
    {
      // fPmBTC/HBTC
      address: '0x48c59199da51b7e30ea200a74ea07974e62c4ba7',
      startBlock: 12146645,
    },
    {
      // fPmBTC/TBTC
      address: '0xb61a6f928b3f069a68469ddb670f20eeeb4921e0',
      startBlock: 12146645,
    },
    {
      // fPmBTC/tBTCv2
      address: '0xc3280306b6218031E61752d060b091278d45c329',
      startBlock: 13460377,
    },
    {
      // fPmUSD/BUSD
      address: '0xfe842e95f8911dcc21c943a1daa4bd641a1381c6',
      startBlock: 12146707,
    },
    {
      // fPmUSD/GUSD
      address: '0x4fb30c5a3ac8e85bc32785518633303c4590752d',
      startBlock: 12146745,
    },
    {
      // fPmUSD/alUSD
      address: '0x4eaa01974b6594c0ee62ffd7fee56cf11e6af936',
      startBlock: 12806795,
    },
    {
      // fPmUSD/RAI
      address: '0x36F944B7312EAc89381BD78326Df9C84691D8A5B',
      startBlock: 13643595,
    },
    {
      // fPmUSD/FEI
      address: '0x2F1423D27f9B20058d9D1843E342726fDF985Eb4',
      startBlock: 13682060,
    },
  ],
  polygon: [
    {
      // mUSD
      address: '0xe840b73e5287865eec17d250bfb1536704b43b21',
      startBlock: 13630640,
      isMasset: true,
    },
    {
      // fpmUSD/FRAX
      address: '0xb30a907084ac8a0d25dddab4e364827406fd09f0',
      startBlock: 16099014,
    },
  ],
};

const OWN_ASSETS = new Set([
  '0xe2f2a5c287993345a840db3b0845fbc70f5935a5', // Ethereum mUSD
  '0x945facb997494cc2570096c74b5f66a3507330a1', // Ethereum mBTC
  '0xe840b73e5287865eec17d250bfb1536704b43b21', // Polygon mUSD
].map((a) => a.toLowerCase()));

async function tvl(api) {
  const assets = ASSETS[api.chain]
  const info = await api.multiCall({ abi: MASSET_ABI_V2.getBassets, calls: assets.map(asset => asset.address) })
  info.forEach((res) => {
    res.personal.forEach((basset, j) => {
      const token = basset.addr.toLowerCase()
      if (OWN_ASSETS.has(token)) return;
      const balance = res.data[j][1]
      api.add(token, balance)
    })
  })
}

module.exports = {
  start: '2020-05-28', // May-28-2020 00:00:00
  polygon: {
    tvl,
  },
  ethereum: {
    tvl,
  },
};
