const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

// Cygnus is extending the restaking protocol to more chains.
// Bsquared is one of the first chains we are supporting.

const CYGNUS_POOL_CONFIG = {
  bsquared: {
    UBTC: {
      depositToken: ADDRESSES.bsquared.UBTC,
      vault: '0x7551aEa51588AaCe99B89c3FaC3CFc4108DB8094'
    },
    STBTC: {
      depositToken: ADDRESSES.swellchain.stBTC,
      vault: '0x0Ce45dd53affbb011884EF1866E0738f58AB7969'
    },
    UNIBTC: {
      depositToken: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
      vault: '0xBc323bA4bbf2559417C3Ca47A75e2Ea341Cf8320'
    }
  },
  base: {
    sUSDS: {
      depositToken: '0x5875eee11cf8398102fdad704c9e96607675467a',
      vault: '0xc9915B93e88C40f40859652F6dD150b70A1A881E'
    },
    clBTC: {
      depositToken: '0x8d2757ea27aabf172da4cca4e5474c76016e3dc5',
      vault: '0x3F772356E77F38B7d5432e29C7F16B66a49f9801'
    },
    cgETH_hashkey: {
      depositToken: '0xf587b7116879a529353cc71ee959cd69fd5cae48',
      vault: '0xD4a90C85cd602aF645015FeE43354120D5eC4102'
    }
  },
  arbitrum: {
    clBTC: {
      depositToken: '0x1792865d493fe4dfdd504010d3c0f6da11e8046d',
      vault: '0xE7ae30C03395D66F30A26C49c91edAe151747911'
    },
    cgETH_hashkey: {
      depositToken: '0x0ce45dd53affbb011884ef1866e0738f58ab7969',
      vault: '0x8d2757EA27AaBf172DA4CCa4e5474c76016e3dC5'
    }
  },
  optimism: {
    clBTC: {
      depositToken: '0x1792865d493fe4dfdd504010d3c0f6da11e8046d',
      vault: '0xE7ae30C03395D66F30A26C49c91edAe151747911'
    },
    cgETH_hashkey: {
      depositToken: '0x0ce45dd53affbb011884ef1866e0738f58ab7969',
      vault: '0x8d2757EA27AaBf172DA4CCa4e5474c76016e3dC5'
    }
  },
  ethereum: {
    clBTC: {
      depositToken: '0xe7ae30c03395d66f30a26c49c91edae151747911',
      vault: '0xc1c1688b66180Cb91f4ac2f615D49F1C256CF003'
    },
    cgETH_hashkey: {
      depositToken: '0xc60a9145d9e9f1152218e7da6df634b7a74ae444',
      vault: '0x59BD72aBDc17056487220511F1Af0c76b2b071d1'
    }
  },

}


module.exports = {
  methodology: "Calculates assets locked in cygnus restaking vault",
}

Object.keys(CYGNUS_POOL_CONFIG).forEach(chain => {
  const tokensAndOwners = Object.values(CYGNUS_POOL_CONFIG[chain]).map(i => [i.depositToken, i.vault])
  module.exports[chain] = { tvl: sumTokensExport({ tokensAndOwners }) }
})
