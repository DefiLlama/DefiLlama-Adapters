const { sumTokensExport } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');
const Addresses = require('./addresses.js');
const Contracts = Addresses.Contracts;
const Tokens = Addresses.Tokens


const WALLET_GNOSIS_DAO_eth = '0x849d52316331967b6ff1198e5e32a0eb168d039d'
const WALLET_GNOSIS_LTD_eth = '0x4971dd016127f390a3ef6b956ff944d0e2e1e462'
const WALLET_ENS_eth = '0x4F2083f5fBede34C2714aFfb3105539775f7FE64'
const WALLET_BALANCER_eth = '0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89'
const WALLET_KPK_eth = '0x58e6c7ab55aa9012eacca16d1ed4c15795669e1c'
const WALLET_COW_eth = '0x616de58c011f8736fa20c7ae5352f7f6fb9f0669'

const WALLET_GNOSIs_DAO_gno = '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f'
const WALLET_GNOSIS_LTD_gno = '0x10e4597ff93cbee194f4879f8f1d54a370db6969'
const WALLET_KPK_gno = '0x54e191b01aa9c1f61aa5c3bce8d00956f32d3e71'

const Wallets = {
    ethereum: [
    WALLET_BALANCER_eth,
    WALLET_ENS_eth,
    WALLET_GNOSIS_DAO_eth,
    WALLET_GNOSIS_LTD_eth,
    WALLET_KPK_eth,
    WALLET_COW_eth,
],
gnosis: [
    WALLET_GNOSIs_DAO_gno,
    WALLET_GNOSIS_LTD_gno,
    WALLET_KPK_gno,
]
}


function cartesianProduct(a, b) {
    return a.flatMap(x => b.map(y => [x, y]));
}

//Testing a a contract function call
const ilk = sdk.api.abi.call({
    target: Contracts.Maker.CDP_MANAGER_ADDRESS,
    abi: 'function ilks(uint256) view returns (bytes32)',
    params: [12],
})
//console.log(ilk)

console.log(sumTokensExport({
    tokensAndOwners: cartesianProduct(Tokens.ethereum, Wallets.ethereum)}))

module.exports = {
    ethereum: {
        tvl: sumTokensExport({
                tokensAndOwners: cartesianProduct(Tokens.ethereum, Wallets.ethereum)
        })
    },
    xdai: {
        tvl: sumTokensExport({
                tokensAndOwners: cartesianProduct(Tokens.gnosis, Wallets.gnosis)
        }),
    }
};
//To test, run
//node test.js projects/karpatkey/index.js
