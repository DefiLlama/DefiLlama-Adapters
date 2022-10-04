const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  const tokens = {
    ETH: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    BTC: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    FTT: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3',
    WSOL: 'So11111111111111111111111111111111111111112',
    MSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    stSOL: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
    LDO: 'HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p',
  }
  const collateralVault = 'HZYHFagpyCqXuQjrSCN2jWrMHTVHPf9VWP79UGyvo95L'
  return sumTokens2({ owner: collateralVault, tokens: Object.values(tokens) })
}

async function staking() {
  return sumTokens2({ owner: 'GbjqYShCb3LeyXuxkjLBGcmrWakqePPpMoHraQJcTtJJ', tokens: ['HBB111SCo9jkCejsZfz8Ec8nH7T6THF8KEKSnvwT6XK6'] })
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking, },
};
