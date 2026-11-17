const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { post } = require('../helper/http')

const FACTORY = '0x619BE899317C58abEe3c0CE3c6D6A605221dD26f'
const FACTORY_DEPLOY_BLOCK = 26106422

const BEACON_VALIDATORS_API = 'https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/head/validators'
const BEACON_BATCH_SIZE = 1000

const abi = {
  cofferIssued: 'event CofferIssued(address indexed owner, address indexed cofferAddress, bytes32 indexed publicKeyPart1, bytes16 publicKeyPart2, uint32 interestRate, uint32 minimumDuration, uint32 maximumDuration, uint128 minimumValueToAccept, uint16 issueSizeBufferBps, uint128 issueSize)',
  bondBought: 'event BondBought(address indexed holderAddress, uint256 indexed bondId, uint128 indexed bondMaturityValue, uint32 duration, uint128 principal, uint32 interestRate)',
  redemptionEscrow: 'address:I_COFFER_REDEMPTION_ESCROW_ADDRESS',
  validatorConditions: 'function sValidatorConditions() view returns (uint128 issueSize, uint32 interestRate, uint32 minimumDuration, uint32 maximumDuration, uint128 minimumValueToAccept, uint32 version, uint32 outstandingBonds, uint16 issueSizeBufferBps, bool isActive, bool validatorDefaulted)',
  holderConditions: 'function sHolderConditions(uint256 bondId) view returns (uint128 bondMaturityValue, uint32 duration, uint32 startTimestamp)',
}

// Every Coffer the factory deployed, with the validator key it is bound to and its creation block
async function getCoffers(api) {
  const logs = await getLogs({ api, target: FACTORY, eventAbi: abi.cofferIssued, fromBlock: FACTORY_DEPLOY_BLOCK, extraKey: 'coffer-issued' })
  return logs.map(({ args, blockNumber }) => ({
    address: args.cofferAddress.toLowerCase(),
    pubkey: (args.publicKeyPart1 + args.publicKeyPart2.slice(2)).toLowerCase(),
    fromBlock: blockNumber,
  }))
}

// Beacon-chain balance (wei) of each Coffer's registered validator, counted only when the validator's
// 0x01/0x02 withdrawal credentials point at that Coffer. The factory event alone proves nothing: anyone can
// register any key, so a validator that was never deposited, still has 0x00 credentials or withdraws to
// another address adds nothing. Stray validators that point at a Coffer without being its registered key
// are never queried, since a Coffer can only send exit and withdrawal requests for its own key.
async function getBoundValidatorBalance(coffers) {
  // several Coffers can share a pubkey, at most one of them can match the validator's credentials
  const coffersByPubkey = {}
  for (const { address, pubkey } of coffers) {
    if (!coffersByPubkey[pubkey]) coffersByPubkey[pubkey] = new Set()
    coffersByPubkey[pubkey].add(address)
  }

  const pubkeys = Object.keys(coffersByPubkey)
  let balance = 0n
  for (let i = 0; i < pubkeys.length; i += BEACON_BATCH_SIZE) {
    const { data } = await post(BEACON_VALIDATORS_API, { ids: pubkeys.slice(i, i + BEACON_BATCH_SIZE) })
    for (const { balance: gwei, validator } of data) {
      const credentials = validator.withdrawal_credentials.toLowerCase()
      // 0x01/0x02 credentials: type byte, 11 zero bytes, then the 20-byte withdrawal address
      if (!/^0x0[12]0{22}[0-9a-f]{40}$/.test(credentials)) continue
      const withdrawalAddress = '0x' + credentials.slice(26)
      if (coffersByPubkey[validator.pubkey.toLowerCase()]?.has(withdrawalAddress))
        balance += BigInt(gwei) * 1_000_000_000n
    }
  }
  return balance
}

async function tvl(api) {
  const coffers = await getCoffers(api)
  const escrow = await api.call({ target: FACTORY, abi: abi.redemptionEscrow })
  api.addGasToken(await getBoundValidatorBalance(coffers))
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

  const purchases = await Promise.all(coffersWithBonds.map(coffer => getLogs({
    api, target: coffer.address, eventAbi: abi.bondBought, fromBlock: coffer.fromBlock, onlyArgs: true, extraKey: 'bond-bought',
  })))
  const bonds = coffersWithBonds.flatMap((coffer, i) => purchases[i].map(bond => ({ coffer, bond })))
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
  methodology: "TVL is the ETH backing Coffer bonds. It counts the beacon-chain balance of each Coffer's registered validator, but only when that validator's 0x01/0x02 withdrawal credentials point at the Coffer contract, plus ETH held by the Coffer contracts and by the redemption escrow awaiting holder claims. Deposits still in the beacon deposit queue are not counted. Bond purchases are paid out to validators, so outstanding bonds are reported as borrowed, valued at principal plus interest accrued to date, or at full remaining value once a Coffer is in default. Protocol fees held by FeeCurve and the marketplace are excluded.",
  timetravel: false, // validator balances come from a live beacon node, so past dates can't be recomputed
  ethereum: {
    tvl,
    borrowed,
  },
}
