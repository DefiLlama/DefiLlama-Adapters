const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const ignored = ["0xC011A72400E58ecD99Ee497CF89E3775d4bd732F", "0x57Ab1E02fEE23774580C119740129eAC7081e9D3", // old synthetix
//self destructed
"0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
"0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414",

// pool tokens
"0x05f21bacc4fd8590d1eaca9830a64b66a733316c", "0x089443665084fc50aa6f1d0dc0307333fd481b85", "0x02d2e2d7a89d6c5cb3681cfcb6f7dac02a55eda4",
"0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c",
"0xa13a9247ea42d743238089903570127dda72fe44", // eth bb-a-USD
]

async function tvl(timestamp, block, _, { api, }) {
  let poolLogs = await getLogs({
    target: '0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd',
    topic: 'LOG_NEW_POOL(address,address)',
    fromBlock: 9562480,
    api,
    eventAbi: 'event LOG_NEW_POOL (address indexed caller, address indexed pool)',
    onlyArgs: true,
  })

  const pools = poolLogs.map(i => i.pool)
  const tokens = await api.multiCall({  abi: "address[]:getCurrentTokens", calls: pools})
  const ownerTokens = tokens.map((v, i) => [v, pools[i]])
  return sumTokens2({ api, ownerTokens, blacklistedTokens: [...ignored, ...pools, ]})
}

module.exports = {
  ethereum:{
    tvl
  }
}
