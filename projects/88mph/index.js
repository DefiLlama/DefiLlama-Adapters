const sdk = require('@defillama/sdk')

const { staking } = require('../helper/staking')
const { getUniqueAddresses } = require('../helper/utils')

const config = {
  ethereum: { dpools: [
    "0x19e10132841616ce4790920d5f94b8571f9b9341",
    "0x22e6b9a65163ce1225d1f65ef7942a979d093039",
    "0x23fa6b36e870ca5753853538d17c3ca7f5269e84",
    "0x2f3efd1a90a2336ab8fa1b9060380dc37361ca55",
    "0x303cb7ede0c3ad99ce017cdc3abacd65164ff486",
    "0x35966201a7724b952455b73a36c8846d8745218e",
    "0x374226dbaa3e44bf3923afb63f5fd83928b7e148",
    "0x3f5611f7762cc39fc11e10c864ae38526f650e9d",
    "0x6712baab01fa2dc7be6635746ec2da6f8bd73e71",
    "0x681aaa7cf3f7e1f110842f0149ba8a4af53ef2fd",
    "0x904f81eff3c35877865810cca9a63f2d9cb7d4dd",
    "0xb1abaac351e06d40441cf2cd97f6f0098e6473f2",
    "0xd4837145c7e13d580904e8431cfd481f9794fc41",
    "0xdc86ac6140026267e0873b27c8629efe748e7146",
    "0xe615e59353f70ca2424aa0f24f49c639b8e924d3",
    "0xe8c52367b81113ed32bb276184e521c2fbe9393a",
  ], vPools: [
    "0x062214fbe3f15d217512deb14572eb01face0392",
    "0x085d70ca0dade4683d0f59d5a5b7d3298011b4de",
    "0x0f834c3601088d1b060c47737a2f5ce4ffa5ac1d",
    "0x0fd585328666923a3a772dd5c37e2dc065c7b137",
    "0x10e8bd414eee26d82e88d6e308fd81ef37d03155",
    "0x11b1c87983f881b3686f8b1171628357faa30038",
    "0x1821aadb9ac1b7e4d56c728afdadc7541a785cd2",
    "0x24867f5665414d93f7b3d195f848917d57d5be27",
    "0x2a74f09a8e4899115529ec8808c5fc1de62c2fe4",
    "0x2d3141f4c9872d4f53b587c3fb8b22736feb54b0",
    "0x3816579c8cb62500a45ae29a33040a3dea4160de",
    "0x46603a1cca20e7ae18f1a069125369609d9d4153",
    "0x4b4626c1265d22b71ded11920795a3c6127a0559",
    "0x4d794db79c4a85dc763d08a7c440a92a2d153ffd",
    "0x4f7ec502ca0be8ef1f984ab1f164022a15ff5561",
    "0x572be575d1aa1ca84d8ac4274067f7bcb578a368",
    "0x5b1a10aaf807d4297048297c30b2504b42c3395f",
    "0x60f0f24b0fbf066e877c3a89014c2e4e98c33678",
    "0x6d97ea6e14d35e10b50df9475e9efaad1982065e",
    "0x6e6002a4bd704a3c8e24a70b0be670f1c2b4d35c",
    "0x7dc14d047d6d8bb03539f92b9e2ca1f1648a5717",
    "0x7f10134c32a4544e4cdc0fd57f5c820bff3070e9",
    "0xa0e78812e9cd3e754a83bbd74a3f1579b50436e8",
    "0xae5dde7ea5c44b38c0bccfb985c40006ed744ea6",
    "0xb1b225402b5ec977af8c721f42f21db5518785dc",
    "0xf61681b8cbf87615f30f96f491fa28a2ff39947a",
    "0xbfdb51ec0adc6d5bf2ebba54248d40f81796e12b",
    "0x5dda04b2bdbbc3fcfb9b60cd9ebfd1b27f1a4fe3",
    "0xf50ef673ee810e6acb725f941a53bf92586a39ad",
    "0x6bf909ce507e94608f0fcbab2cfdd499e0150a21",
    "0xafdd82d73f5dae907f86ad37f346221081dc917b",
    "0x8eb1b3ac29e0dcbd7f519c86f1eb76a3aea41b76",
    "0xc1f147db2b6a9c9fbf322fac3d1fbf8b8aaeec10"
  ] },
  avax: { dpools: [
    "0x2252185532317932b1883b3429407296a2c69244",
      "0x336c38657837aa2b5fd21d41ea651b6d792291d9",
      "0x4f28fc2be45682d1be1d0f155f4a52d4509db629",
      "0x58e65f624c5ecf595824c96b3853ea8da2f9adf1",
      "0x747cdec7d885ca961baec11481cda651bf4d1004",
      "0xa78276c04d8d807feb8271fe123c1f94c08a414d",
      "0xbcd1571761c2f3d8e0ae93651753aa968e357425",
      "0xc7cbb403d1722ee3e4ae61f452dc36d71e8800de",
      "0xd1fea1b2dc4e0be1f5f16bacf1dfeb7fc3434b5f",
      "0xd9f46096801799f59f34c95e0b4df0f6a76bfcf3",
      "0xeb706249f3b4640839e64211336b2063a3cdfbb9",
      "0xf0ca068be757e61cdfa6314bf59f5243767f1bfd"
  ] },
  fantom: { dpools: [
    "0x23fe5a2ba80ea2251843086ec000911cfc79c864",
      "0x2744b79c985ae0c6b81f1da8eed1a4c67eb4b732",
      "0x3cab1cb5a9b68350b39ddf7ce23518d609a8bc78",
      "0x7e4697f650934ea6743b8b0619fc2454db02405a",
      "0xa1857578cec558eaed9120739b0c533549bdcb61",
      "0xa78276c04d8d807feb8271fe123c1f94c08a414d",
      "0xbdf43e9c6cf68359deff9292098622643ede5ec3",
      "0xc0710b3564fd4768f912150d39d519b66f2952d4",
      "0xc7cbb403d1722ee3e4ae61f452dc36d71e8800de",
      "0xc80cc61910c6f8f47aadc69e40ab8d1b2fa2c4df",
      "0xc91c2255525e80630eee710e7c0637bce7d98978",
      "0xcb29ce2526ff5f80ad1536c6a1b13238d615b4b9",
      "0xd62f71937fca1c7c05da08cec4c451f12fc64964",
      "0xf7fb7f095c8d0f4ee8ffbd142fe0b311491b45f3"
  ], vPools: [
    "0x3cab1cb5a9b68350b39ddf7ce23518d609a8bc78",
    "0xa1857578cec558eaed9120739b0c533549bdcb61",
    "0xa78276c04d8d807feb8271fe123c1f94c08a414d",
    "0xbdf43e9c6cf68359deff9292098622643ede5ec3",
    "0xc0710b3564fd4768f912150d39d519b66f2952d4",
    "0xc7cbb403d1722ee3e4ae61f452dc36d71e8800de",
    "0xcb29ce2526ff5f80ad1536c6a1b13238d615b4b9",
    "0xd62f71937fca1c7c05da08cec4c451f12fc64964",
    "0xf7fb7f095c8d0f4ee8ffbd142fe0b311491b45f3",
    "0x23fe5a2ba80ea2251843086ec000911cfc79c864",
    "0xc80cc61910c6f8f47aadc69e40ab8d1b2fa2c4df",
    "0x7e4697f650934ea6743b8b0619fc2454db02405a",
    "0x2744b79c985ae0c6b81f1da8eed1a4c67eb4b732",
    "0xc91c2255525e80630eee710e7c0637bce7d98978"
  ] },
  polygon: { dpools: [
    "0x0e99145166e2982bb67054a1e5d3a902fc4d2b59",
    "0x3933baac41f04d0ffa0977b0e879bc56482ad667",
    "0x3b79eb9675ed29554f57b719dc66a461a4c84970",
    "0x4f28fc2be45682d1be1d0f155f4a52d4509db629",
    "0xa78276c04d8d807feb8271fe123c1f94c08a414d",
    "0xf5ef24a27f35cbe8a2b0a954acf81d7064ce6b70"
  ] },
}

const tvlExports = {};

Object.keys(config).forEach(chain => {
  let { dpools: pools, vPools = [], } = config[chain]
  tvlExports[chain] = {
    tvl: async (api) => {
      const balances = {}

      pools.push(...vPools)
      pools = getUniqueAddresses(pools)
      const tokens = await api.multiCall({ abi: 'address:stablecoin', calls: pools })
      const bals = await api.multiCall({ abi: 'uint256:totalDeposit', calls: pools })
      const bals2 = await api.multiCall({ abi: 'uint256:totalInterestOwed', calls: pools })
      bals.forEach((b, i) => sdk.util.sumSingleBalance(balances, tokens[i], b, api.chain))
      bals2.forEach((b, i) => sdk.util.sumSingleBalance(balances, tokens[i], b, api.chain))
      return balances
    },
  }
})

tvlExports.ethereum.staking = staking("0x1702F18c1173b791900F81EbaE59B908Da8F689b", "0x8888801af4d980682e47f1a9036e589479e835c5")

module.exports = {
  methodology: `Using the addresses for the fixed interest rate bonds we are able to find the underlying tokens held in each address. Once we have the underlying token we then get the balances of each of the tokens. For the CRV tokens used "CRV:STETH" for example, the address is replaced with the address of one of the tokens. In the example at hand the address is replaced with the "WETH" address so that the price can be calculated.`,
  start: 1606109629, // Monday, November 23, 2020 5:33:49 AM GMT
  ...tvlExports
}
