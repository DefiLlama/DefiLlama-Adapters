const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { getStakedEthTVL } = require('../helper/utils')

const FACTORY = '0x619BE899317C58abEe3c0CE3c6D6A605221dD26f'
const FACTORY_DEPLOY_BLOCK = 26106422

const abi = {
  cofferIssued: 'event CofferIssued(address indexed owner, address indexed cofferAddress, bytes32 indexed publicKeyPart1, bytes16 publicKeyPart2, uint32 interestRate, uint32 minimumDuration, uint32 maximumDuration, uint128 minimumValueToAccept, uint16 issueSizeBufferBps, uint128 issueSize)',
  bondBought: 'event BondBought(address indexed holderAddress, uint256 indexed bondId, uint128 indexed bondMaturityValue, uint32 duration, uint128 principal, uint32 interestRate)',
  redemptionEscrow: 'address:I_COFFER_REDEMPTION_ESCROW_ADDRESS',
  validatorConditions: 'function sValidatorConditions() view returns (uint128 issueSize, uint32 interestRate, uint32 minimumDuration, uint32 maximumDuration, uint128 minimumValueToAccept, uint32 version, uint32 outstandingBonds, uint16 issueSizeBufferBps, bool isActive, bool validatorDefaulted)',
  holderConditions: 'function sHolderConditions(uint256 bondId) view returns (uint128 bondMaturityValue, uint32 duration, uint32 startTimestamp)',
}

// Every Coffer the factory deployed, with its creation block
async function getCoffers(api) {
  const logs = await getLogs({ api, target: FACTORY, eventAbi: abi.cofferIssued, fromBlock: FACTORY_DEPLOY_BLOCK, extraKey: 'coffer-issued' })
  return logs.map(({ args, blockNumber }) => ({
    address: args.cofferAddress.toLowerCase(),
    fromBlock: blockNumber,
  }))
}

async function tvl(api) {
  const coffers = await getCoffers(api)
  const escrow = await api.call({ target: FACTORY, abi: abi.redemptionEscrow })
  // beacon-chain balance of the validators whose withdrawal credentials point at a Coffer
  await getStakedEthTVL({ withdrawalAddresses: coffers.map(i => i.address) })(api)
  // ETH in the Coffers (bond funding, consensus-layer withdrawals) and in the escrow (redeemed bonds awaiting claims)
  return api.sumTokens({ owners: [...coffers.map(i => i.address), escrow], tokens: [ADDRESSES.null] })
}

// Outstanding bonds at what the validator owes today: principal plus the interest accrued so far. A default
// makes every bond claimable at once, so a defaulted Coffer's bonds count at their full remaining value.
async function borrowed(api) {
  const coffers = await getCoffers(api)
  const conditions = await api.multiCall({ abi: abi.validatorConditions, calls: coffers.map(i => i.address) })
  const coffersWithBonds = coffers
    .map((coffer, i) => ({ ...coffer, defaulted: conditions[i].validatorDefaulted, outstanding: +conditions[i].outstandingBonds }))
    .filter(i => i.outstanding > 0)

  const bonds = []
  for (const coffer of coffersWithBonds) {
    const purchases = await getLogs({
      api, target: coffer.address, eventAbi: abi.bondBought, fromBlock: coffer.fromBlock, onlyArgs: true, extraKey: 'bond-bought',
    })
    purchases.forEach(bond => bonds.push({ coffer, bond }))
  }
  const live = await api.multiCall({
    abi: abi.holderConditions,
    calls: bonds.map(({ coffer, bond }) => ({ target: coffer.address, params: [bond.bondId] })),
  })

  const now = BigInt(api.timestamp ?? Math.floor(Date.now() / 1e3))
  let owed = 0n
  bonds.forEach(({ coffer, bond }, i) => {
    const remaining = BigInt(live[i].bondMaturityValue)
    if (remaining === 0n) return // settled
    if (coffer.defaulted) {
      owed += remaining
      return
    }
    const principal = BigInt(bond.principal)
    const maturityValue = BigInt(bond.bondMaturityValue)
    const duration = BigInt(live[i].duration)
    const start = BigInt(live[i].startTimestamp)
    const elapsed = now > start ? now - start : 0n
    const accrued = elapsed >= duration ? maturityValue : principal + (maturityValue - principal) * elapsed / duration
    owed += accrued < remaining ? accrued : remaining
  })
  api.addGasToken(owed)
}

module.exports = {
  methodology: "TVL is the ETH backing Coffer bonds. It counts the beacon-chain balance of the validators whose withdrawal credentials point at a Coffer contract, plus ETH held by the Coffer contracts and by the redemption escrow awaiting holder claims. Deposits still in the beacon deposit queue are not counted. Bond purchases are paid out to validators, so outstanding bonds are reported as borrowed, valued at principal plus interest accrued to date, or at full remaining value once a Coffer is in default. Protocol fees held by FeeCurve and the marketplace are excluded.",
  timetravel: false, // validator balances come from a live beacon node, so past dates can't be recomputed
  ethereum: {
    tvl,
    borrowed,
  },
}
