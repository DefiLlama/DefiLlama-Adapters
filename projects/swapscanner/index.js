const { stakingUnknownPricedLP } = require("../helper/staking")
const { pool2 } = require("../helper/unknownTokens")

const SCNR = {
  address: "0x8888888888885b073f3c81258c27e83db228d5f3",
  staking: "0x7c59930d1613ca2813e5793da72b324712f6899d",
  LPs: {
    KLAY: "0xe1783a85616ad7dbd2b326255d38c568c77ffa26",
  },
};

const WKLAY = "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74";

module.exports = {
  klaytn: {
    tvl: async () => ({}),
    staking: stakingUnknownPricedLP(SCNR.staking, SCNR.address, 'klaytn', SCNR.LPs.KLAY),
    pool2: pool2({ 
      coreAsset: WKLAY,
      chain: 'klaytn',
      lpToken: SCNR.LPs.KLAY,
      stakingContract: SCNR.staking,
    }),
  },
};
