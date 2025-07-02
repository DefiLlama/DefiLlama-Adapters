const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require("../helper/staking.js");
const { pool2 } = require('../helper/pool2');
const contracts = {
  "ethereum": {
    "holders": {
      "DFL": "0xb685bfdad9da7093168ab75204bbcadf0c69c823",
      "FILST-USDT": "0x9e08bd9a1e3880902688b32d563046cab74d2f2f",
      "FILST-EFIL": "0x312c6ffe7743b964be6da9131e662af5bac55199",
      "FILST": "0x01aabbad98a7638b7f8d65e7ec42560f1afbbf0c"
    },
    "pool2": "0x6b0c7d013cc0b461490287cc20aa9f34f950a6a6",
  },
  "bsc": {
    "holders": {
      "DFL": "0x272257bb03a2b99978a1e6badeba7ccba444d285",
      "FILST-USDT": "0xde6239b3138910c68f318e799b3d332925e9929f",
      "FILST-EFIL": "0x6b9ee349810e660dda9e3557c7a7412e5424ea39",
      "FILST": "0x6c753ca90bad578504314699580c8b01e067a765"
    },
    "pool2": "0x6b6811a710f07b8ac430f6e172833e87c4bd8716",
  }
}

async function tvl(api) {

  const owners = Object.values(contracts[api.chain].holders);
  const tokens = await api.multiCall({ abi: 'address:property', calls: owners })
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], resolveLP: true, })
}

module.exports = {
  bsc: {
    tvl,
    staking: staking(contracts.bsc.holders.DFL, '0x6ded0F2c886568Fb4Bb6F04f179093D3D167c9D7'),
    pool2: pool2(contracts.bsc.pool2, '0x3558C47C0f2309197857689d84Cb620405E2c54D',),
  },
  ethereum: {
    tvl,
    staking: staking(contracts.ethereum.holders.DFL, '0x09ce2b746c32528b7d864a1e3979bd97d2f095ab'),
    pool2: pool2(contracts.ethereum.pool2, '0xd372a3221021Df72eDa38f77117d3A95f057e163',),
  }
};