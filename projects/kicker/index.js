const { getLogs2 } = require('../helper/cache/getLogs')
const { nullAddress } = require('../helper/tokenMapping')

// Kicker pots are redeemable vaults on Robinhood Chain: each pot holds one core asset (native ETH or a tokenized stock such as GLD/NVDA)
// and the creator tax of the coins created through it is collected onto that floor. Pot shares (K) redeem pro rata.
// Every factory version stays live (pots are immutable), so all of them are enumerated.
const FACTORIES = [
    { target: '0x8cedef3db74173bf392cf5e8bafbee6d826fb29b', fromBlock: 61964437 },
    { target: '0x1Cd9e237D19e33a4D12048aa215D8dA06e460641', fromBlock: 62011400 },
    { target: '0xd4CD0618C38Eeff73AE16Cd0c89dD3A79b125603', fromBlock: 62035000 },
    { target: '0x45f20ef40702ef67ecd96180e4b4ea1c368002a7', fromBlock: 62355500 },
    { target: '0x989934128eac33515177cb5a5cc04d8e0467e03e', fromBlock: 62396000 },
    { target: '0x3b38da83fba6e49befa528cd8604fc1023417e29', fromBlock: 62745000 },
    { target: '0x63aa792f2c5a350ce418dccbbc7611c8765826ee', fromBlock: 62746800 },
    { target: '0x9a140c3f2a0b56D6e728AcF5cF7dA310DB7f4491', fromBlock: 63860480 },
    { target: '0x3dAC912C8B1FE43D7a5B6750D7aa5a3C05405Bf4', fromBlock: 65202900 },
    { target: '0x21f98C9bA8C3d357A6E2b7FFAFe80B2eAb0344aC', fromBlock: 65221294 },
    { target: '0x29e6f734eB9410B4c50aeCEEE753a0AC7bd2FeDE', fromBlock: 65382339 },
    { target: '0xA37eA52652D6A5976F9e1BbF33C111176cd0c013', fromBlock: 65643553 },
]

const CREATED = 'event Created(address indexed kicker, address indexed creator, address indexed core, string symbol)'

async function pots(api) {
  const out = []
  for (const f of FACTORIES) {
    const logs = await getLogs2({ api, target: f.target, eventAbi: CREATED, fromBlock: f.fromBlock, extraKey: 'created' })
    out.push(...logs)
  }
  return out
}

async function robinhoodTvl(api) {
  const created = await pots(api)
  // only the core asset is counted; the coins created through a pot that it may hold (its legs) are the protocol's own tokens and are excluded
  const ownerTokens = created.map(i => [[i.core === nullAddress ? nullAddress : i.core], i.kicker])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the core asset (native ETH or a tokenized stock such as GLD/NVDA) held by Kicker pots. Pots are enumerated from the Created events of every factory version. A pot may also hold coins created through it; those are the protocol\'s own tokens and are not counted.',
  robinhood: { tvl: robinhoodTvl },
}
