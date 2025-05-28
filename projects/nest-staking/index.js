// Pre-Deposit TVL
const RWA_STAKING = "0xdbd03D676e1cf3c3b656972F88eD21784372AcAB"
const RESERVE_STAKING = "0xBa0Ae7069f94643853Fce3B8Af7f55AcBC11e397"
const SBTC = "0x094c0e36210634c3CfA25DC11B96b562E0b07624"
const STONE = "0x7122985656e38BDC0302Db86685bb972b145bD3C"


// Vaults TVL
const nELIXIR = "0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c"
const inELIXIR = "0xD3BFd6E6187444170A1674c494E55171587b5641"
const nTBILL = "0xE72Fe64840F4EF80E3Ec73a1c749491b5c938CB9"
const nBASIS = "0x11113Ff3a60C2450F4b22515cB760417259eE94B"
const nALPHA = "0x593cCcA4c4bf58b7526a4C164cEEf4003C6388db"
const nBTC = "0x02cDb5CCc97d5DC7Ed2747831b516669eB635706"
const nCREDIT = "0xA5f78B2A0Ab85429d2DfbF8B60abc70F4CeC066c"
const nPAYFI = "0xb52b090837a035f93A84487e5A7D3719C32Aa8A9"
const nINSTO = "0xbfC5770631641719cd1Cf809D8325B146aED19De"
const nETF = "0xdeA736937d464d288eC80138bcd1a2E109A200e3"


const ethereumVaults = [
  nELIXIR,
  inELIXIR,
  nTBILL,
  nBASIS,
  nALPHA,
  nBTC,
  nCREDIT,
  nPAYFI,
  nINSTO,
  nETF,
]

const arbitrumVaults = [
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
  nETF,
]

const baseVaults = [
  nPAYFI,
  nETF,
  nBTC,
]

async function tvl_ethereum(api) {
  // Get allowed stablecoins from RWA Staking
  const stablecoins = await api.call({ target: RWA_STAKING, abi: 'address[]:getAllowedStablecoins', })
  api.sumTokens({ owner: RWA_STAKING, tokens: stablecoins });
  api.sumTokens({ owner: RESERVE_STAKING, tokens: [SBTC, STONE] });

  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: ethereumVaults })
  api.add(ethereumVaults, details)
}

async function tvl_arbitrum(api) {
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: arbitrumVaults })
  api.add(arbitrumVaults, details)
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
  methodology: "Counts total value locked in RWA Staking (stablecoins), Reserve Staking (SBTC and STONE), nELIXIR, inELIXIR, nTBILL, nBASIS, nALPHA, nBTC, nCREDIT, nPAYFI, nINSTO, and nETF vault contracts",
  ethereum: { tvl: tvl_ethereum },
  arbitrum: { tvl: tvl_arbitrum },
  plume_mainnet: { tvl: tvl_plume },
}
