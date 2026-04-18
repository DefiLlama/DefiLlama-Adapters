const ADDRESSES = require('../helper/coreAssets.json')
const ALLOCATOR_VAULT = '0xe4470DD3158F7A905cDeA07260551F72d4bB0e77';
const ALLOCATOR_BUFFER = '0x065E5De3D3A08c9d14BF79Ce5A6d3D0E8794640c';
const ALM_PROXY = '0xa5139956eC99aE2e51eA39d0b57C42B6D8db0758';

const ETHEREUM_TOKENS = [
    ADDRESSES.ethereum.USDC, // USDC
    ADDRESSES.ethereum.USDT, // USDT
    ADDRESSES.ethereum.DAI, // DAI
    '0xdC035D45d973E3EC169d2276DDab16f1e407384F', // USDS
    ADDRESSES.ethereum.SDAI, // sDAI
    ADDRESSES.ethereum.sUSDS, // sUSDS
    ADDRESSES.ethereum.sUSDe, // sUSDe
    '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE', // sUSDC
    ADDRESSES.ethereum.WETH, // WETH
    ADDRESSES.ethereum.WSTETH, // wstETH
    ADDRESSES.ethereum.RETH, // rETH
    ADDRESSES.ethereum.WBTC, // WBTC
    ADDRESSES.ethereum.tBTC, // tBTC
];

async function tvl(api) {
    const owners = [ALLOCATOR_VAULT, ALLOCATOR_BUFFER, ALM_PROXY];
    return api.sumTokens({ owners, tokens: ETHEREUM_TOKENS });
}

module.exports = {
    methodology: "TVL is calculated by summing token balances in Keel Finance's AllocatorVault, AllocatorBuffer, and ALM Proxy contracts on Ethereum.",
    ethereum: { tvl },
};
