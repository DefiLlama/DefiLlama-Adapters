
// Pre-Deposit TVL
const RWA_STAKING = "0xdbd03d676e1cf3c3b656972f88ed21784372acab"
const RESERVE_STAKING = "0xba0ae7069f94643853fce3b8af7f55acbc11e397"
const SBTC = "0x094c0e36210634c3CfA25DC11B96b562E0b07624"
const STONE = "0x7122985656e38bdc0302db86685bb972b145bd3c"


// Vaults TVL
const nELIXIR = "0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c"
const inELIXIR = "0xd3bfd6e6187444170a1674c494e55171587b5641"
const nTBILL = "0xe72fe64840f4ef80e3ec73a1c749491b5c938cb9"
const nBASIS = "0x11113Ff3a60C2450F4b22515cB760417259eE94B"
const nALPHA = "0x593cCcA4c4bf58b7526a4C164cEEf4003C6388db"
const nBTC = "0x02cdb5ccc97d5dc7ed2747831b516669eb635706"
const nCREDIT = "0xa5f78b2a0ab85429d2dfbf8b60abc70f4cec066c"
const nPAYFI = "0xb52b090837a035f93a84487e5a7d3719c32aa8a9"
const nINSTO = "0xbfc5770631641719cd1cf809d8325b146aed19de"
const nETF = "0xdeA736937d464d288eC80138bcd1a2E109A200e3"


const evmVaults = [
  nELIXIR,
  inELIXIR,
  nTBILL,
  nBASIS,
  nALPHA,
  nBTC,
  nCREDIT,
  nPAYFI,
  nINSTO,
  nETF
]

const arbVaults = [
  nTBILL,

]

const plumeVaults = [
  nELIXIR,
  inELIXIR,
  nTBILL,
  nBASIS,
  nALPHA,
  nBTC,
  nCREDIT,
  nPAYFI,
  nINSTO,
  nETF
]

const baseVaults = [
  nPAYFI,
  nETF,
  nBTC,

]

async function tvl(api) {

  // Get allowed stablecoins from RWA Staking
  const stablecoins = await api.call({ target: RWA_STAKING, abi: 'address[]:getAllowedStablecoins', })
  api.sumTokens({ owner: RWA_STAKING, tokens: stablecoins });
  api.sumTokens({ owner: RESERVE_STAKING, tokens: [SBTC, STONE] });

  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: evmVaults })
  api.add(evmVaults, details)

}

async function tvl_arbitrum(api) {
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: arbVaults })
  api.add(arbVaults, details)
}


async function tvl_plume(api) {
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: plumeVaults })

  api.add(plumeVaults, details)
}

async function tvl_base(api) {
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: baseVaults })
  api.add(baseVaults, details)
}

module.exports = {
  methodology: "Counts total value locked in RWA Staking (stablecoins), Reserve Staking (SBTC and STONE), nELIXIR, inELIXIR, nTBILL, nBASIS, nALPHA, nBTC, nCREDIT, nPAYFI, nINSTO, nETF vault contracts",
  ethereum: { tvl },
  arbitrum: { tvl: tvl_arbitrum },
  plume_mainnet: { tvl: tvl_plume },
}