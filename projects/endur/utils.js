const ADDRESSES = require('../helper/coreAssets.json');
const tBTC = "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f"
const LBTC = "0x036834a40984312f7f7de8d31e3f6305b325389eaeea5b1c0664b2fb936461a4"
const solvBTC = "0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68"

// todo: change BTC variant addresses when defillama support kicks in 
const LSTDATA = [
    { //data of an LST contract; currently only xSTRK 
        address: "0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a", // address of xSTRK vault contract
        token: ADDRESSES.starknet.STRK
    }, 
    {
        address: "0x6a567e68c805323525fe1649adb80b03cddf92c23d2629a6779f54192dffc13",
        token: ADDRESSES.starknet.WBTC
    },
    {
        // tBTC 
        address: "0x43a35c1425a0125ef8c171f1a75c6f31ef8648edcc8324b55ce1917db3f9b91",
        token: tBTC
    },
    {
        // LBTC 
        address: "0x7dd3c80de9fcc5545f0cb83678826819c79619ed7992cc06ff81fc67cd2efe0",
        token: LBTC
    }, 
    {
        // solvBTC
        address: "0x580f3dc564a7b82f21d40d404b3842d490ae7205e6ac07b1b7af2b4a5183dc9",
        token: solvBTC
    }
]

module.exports = {
    LSTDATA,
}