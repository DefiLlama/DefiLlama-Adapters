const {sumTokens} = require('../helper/chain/starknet')
const ADDRESSES = require('../helper/coreAssets.json')

const MARKET = '0x452d088b7b7b84f172f18237c0018b984c6c6f5aa75a42b123e4ddd75e4e775'

const ASSETS = [
    ADDRESSES.starknet.ETH,
    ADDRESSES.starknet.WBTC,
    ADDRESSES.starknet.USDC,
    ADDRESSES.starknet.USDT,
    ADDRESSES.starknet.WSTETH,
    ADDRESSES.starknet.WSTETH_1,
    ADDRESSES.starknet.STRK,
    '0x40e81cfeb176bfdbc5047bbc55eb471cfab20a6b221f38d8fda134e1bfffca4', // DOG
    '0x02650ea9af204ba33d4e743ee8ff826b5bec3f5ce497efed832e5c3794483e3c', // POL
    '0x02f5eb9a4f77b6c7c83488418e77329d31eb43219745959948a0fce9580905d9', // AAVE
    '0x019110887221c1cb3fa95bbbfce818c88bfd6a74af2c4574b6455dd1bdc9a974', // ENA
    '0x049210ffc442172463f3177147c1aeaa36c51d152c1b0630f2364c300d4f48ee', // UNI
    '0x1e70aedffd376afe33cebdf51ed5365131dccb2a5b2cb36d02b785442912b9b', // SOL
    '0x3a292bd498266ac4b05d93cc2df5cd7883c0684faabff182ab568d566a3c151', // JUP
    '0x03070d5cbd310edc0b2cfe8b11d132e67718b16c7fbfd536ee74ec54a4307ba2', // ARB
    '0x6e0e0117b742747452601f9f14576eb9d71b326379a1794bb51d9adbce3dbd3', // FARTCOIN
    '0x74238dfa02063792077820584c925b679a013cbab38e5ca61af5627d1eda736', // BONK
    '0x02119755fad7cbf637d80cae5d3e8e12487befe6653ddd04432a73f6f569f46b', // SHIB
    '0x01e77aec81ef65db5fb788a5a04fd9d23f6f4c860eb2fb0e99ace5c45b021071', // ZRO
    '0x7380caa64fdf27501afad0bd93c89d1e83a081a553af89bbeffb28dae8d8916', // TRUMP
]

async function starknetTvl(api) {
    return sumTokens({
        api,
        owner: MARKET,
        tokens: ASSETS
    })
}


module.exports = {
    timetravel: true,
    methodology: 'The TVL is calculated as a sum of total assets deposited into the core contract of LayerAkira DEX',
    starknet: {tvl: starknetTvl,},
    isHeavyProtocol: false,
}