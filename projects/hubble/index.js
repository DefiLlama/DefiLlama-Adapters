const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/solana");

const ignoreBadTokens = true;

async function tvl() {
  const collateralTokens = {
    ETH: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    BTC: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    FTT: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3',
    WSOL: ADDRESSES.solana.SOL,
    MSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    stSOL: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
    LDO: 'HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p',
  }
  const collateralVaultAuthority = 'HZYHFagpyCqXuQjrSCN2jWrMHTVHPf9VWP79UGyvo95L'
  const collateralTokensAndOwners = Object.values(collateralTokens).map((mint) => [mint, collateralVaultAuthority])

  const psmTokens = {
    USDC: ADDRESSES.solana.USDC
  }
  const psmVaultAuthority = '8WrqMitrgjzfqaPJ5PK6X3VT6B1Z8rDgQQny2aWwvJ8q'
  const psmTokensAndOwners = Object.values(psmTokens).map((mint) => [mint, psmVaultAuthority])

  const tokensAndOwners = [...collateralTokensAndOwners, ...psmTokensAndOwners]
  return sumTokens2({ tokensAndOwners, ignoreBadTokens })
}

async function staking() {
  const hbbStakingPoolTokenAndOwner = [
    'HBB111SCo9jkCejsZfz8Ec8nH7T6THF8KEKSnvwT6XK6',
    'GbjqYShCb3LeyXuxkjLBGcmrWakqePPpMoHraQJcTtJJ'
  ]

  const tokensAndOwners = [hbbStakingPoolTokenAndOwner]
  return sumTokens2({ tokensAndOwners, ignoreBadTokens })
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking, },
};
