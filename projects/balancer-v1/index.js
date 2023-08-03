const ADDRESSES = require('../helper/coreAssets.json')
const { v1Tvl } = require('../helper/balancer')

const blacklistedTokens = [
  "0xC011A72400E58ecD99Ee497CF89E3775d4bd732F",
  ADDRESSES.ethereum.sUSD_OLD,
  //self destructed
  "0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
  "0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414",
]

module.exports = {
  ethereum:{
    tvl: v1Tvl('0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd', 9562480, { blacklistedTokens })
  }
}
