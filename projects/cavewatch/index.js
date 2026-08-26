const ADDRESSES = require('../helper/coreAssets.json')

const OIX = '0xA9Ad4Da4b2FEd87CCe1f91225609bF4ccFacc7Fb'
const VAULT = '0x8a745eF816a0d241cb0cEDCE253A30433D3cF366'

const ETH_HOLDERS = [
  '0x345fA314427518F608FA72d1B61249f6dBd3Ff63', // Hunt
  '0x6576EB3b3B95BEBdb3635b0d6B8cF6611Bc6543a', // Motherlode
  '0xdb6A919e7502B45c5a299c9f0b2782fD7FAaf1f8', // Lucky Vein
  '0xD902868cf0F9D5016B66E40ADf95C7Bea24D935a', // Auto Hunt
]

async function tvl(api) {
  await api.sumTokens({
    tokens: [ADDRESSES.null],
    owners: ETH_HOLDERS,
  })
}

async function staking(api) {
  const locked = await api.call({
    target: VAULT,
    abi: 'uint256:accountedLockedTokens',
  })

  api.add(OIX, locked)
}

module.exports = {
  methodology:
    'TVL counts native ETH held in CaveWatch Hunt, Motherlode, Lucky Vein and Auto Hunt contracts. Recoverable OIX locked in the OIX Vault is reported as staking. Permanently sacrificed OIX, OIX release inventory, treasury balances, Vault reward ETH and game-held OIX are excluded.',
  robinhood: {
    tvl,
    staking,
  },
}
