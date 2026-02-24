const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require('../helper/treasury');

// Mainnet
const ETHIX_TOKEN_MAINNET = '0xFd09911130e6930Bf87F2B0554c44F400bD80D3e';
const COLLATERAL_RESERVE_MAINNET = '0xb97Ef216006d72128576D662CFFEd2B4406E3518'; // Protocol owned
const TREASURY_MAINNET = '0xb27132625173F813085E438eE19c011867063073'; // Protocol owned (Rewards reserve)

// Celo
const ETHIX_TOKEN_CELO = ADDRESSES.celo.ETHIX;
const COLLATERAL_RESERVE_CELO = '0xA14B1D7E28C4F9518eb7757ddeE35a18423e1567'; // Protocol owned
const TREASURY_CELO = '0xa9a824bD0470d0d00938105986ebfbFa71b28530'; // Protocol owned (Rewards reserve)

module.exports = treasuryExports({
    ethereum: {
        owners: [COLLATERAL_RESERVE_MAINNET, TREASURY_MAINNET],
        ownTokens: [ETHIX_TOKEN_MAINNET]
    },
    celo: {
        owners: [COLLATERAL_RESERVE_CELO, TREASURY_CELO],
        ownTokens: [ETHIX_TOKEN_CELO]
    },
});