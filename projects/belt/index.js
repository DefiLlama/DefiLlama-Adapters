const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

// https://docs.belt.fi/contracts/contract-deployed-info
const bscVaults = [
    ADDRESSES.bsc.beltBTC,
    ADDRESSES.bsc.beltETH,
    ADDRESSES.bsc.beltBNB,
    '0x9171Bf7c050aC8B4cf7835e51F7b4841DFB2cCD0',
    '0x55E1B1e49B969C018F2722445Cd2dD9818dDCC25',
    '0x7a59bf07D529A5FdBab67D597d63d7D5a83E61E5',
    '0x9A86fc508a423AE8a243445dBA7eD5364118AB1D'
]

const hecoVaults = [
    '0x4Cd59EEB3a4D2fa5c35FD3dE0BA1723EeaF1D258',
    '0xB1493B7bc8e260B0b25235ae5c34B0dC201ce8C3',
    '0x86f5C8EB736c95dd687182779edd792FEF0fA674',
    '0xA8714b9c86Fb590bF2CEE12bdFccC575aB454272',
    '0xC04a84d0E3f290D0777c233E0945678469adF353',
    '0x9bC7a8ec3a8b9d9AEc0C5808456e35A934f457e5',
    '0x0e564BC863c2072C47FB8f952062BD5bc673E142'
]

// const klaytnVaults = [
//     '0xe510d40a4B92302798d6baA1eF004E4629438e81',
//     '0x426533F501c3615A4244087d2A9981b037C40D46',
//     '0x826c88315bb441e6886a63f80164E67F89359C5A',
//     '0xe7fa18E435FE9aCBdFb5016514B00C61C9a27507',
//     '0x39Ff319dd1282452cd73154B6ac670449234230F',
//     '0x430a6768Ef348B06F65F1FEEf01B9b2B58C75f79',
//     '0xf70644e5650e2ef5f0D31dF46e7e369771c2707F'
// ]

const tetherLP = "0x04100231d548Df31a003BEb99e81e3305Be9647b"
// const BELT = "0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f"

async function getTvl(chain, block, address) {
    const underlyingTokens = await sdk.api.abi.multiCall({
        chain: chain,
        calls: address.map(v=>({target:v})),
        block,
        abi: abi.token
    })
    const underlyingBalances = await sdk.api.abi.multiCall({
        chain: chain,
        calls: address.map(v=>({target:v})),
        block,
        abi: abi.calcPoolValueInToken
    })
    const balances = {}
    underlyingBalances.output.forEach((balance, index)=>{
        sdk.util.sumSingleBalance(balances, chain+':'+underlyingTokens.output[index].output, balance.output)
    })

    const beltInfo = await get('https://ss.belt.fi/info/all.json')
    const lockedUSDT = beltInfo.info[chain.toUpperCase()].vaultPools.find(x => x.wantToken.toLowerCase() === tetherLP.toLowerCase())
    const [ usdt, wantLocked ] = Object.entries(toUSDTBalances(lockedUSDT.wantLocked))[0]
    balances[usdt] = wantLocked

    return balances
}


function bscTvl(timestamp, ethBlock, chainBlocks) {
    return getTvl('bsc', chainBlocks['bsc'], bscVaults)
}

function hecoTvl(timestamp, ethBlock, chainBlocks) {
    return getTvl('heco', chainBlocks['heco'], hecoVaults)
}

async function klaytnTvl() {
    const beltInfo = await get('https://ss.belt.fi/info/all.json')
    var tvl = new BigNumber('0');

    beltInfo.info.KLAYTN.vaults.forEach(vault =>{
        tvl = tvl.plus(vault.tvl)
    })

    const lockedUSDT = beltInfo.info.KLAYTN.vaultPools.find(x => x.wantToken.toLowerCase() === tetherLP.toLowerCase())
    tvl = tvl.plus(lockedUSDT.wantLocked)

    return toUSDTBalances(tvl.toFixed(2))
}

async function getStaking(chain) {
    const beltInfo = await get('https://ss.belt.fi/info/all.json')
    const stakingInfo = beltInfo.info[chain.toUpperCase()].staking

    return toUSDTBalances(stakingInfo.tvl)
}

module.exports = {
    timetravel: false,
    methodology: 'TVL includes the liquidity of all the Vaults, 3Tether LP and staking counts the BELT that has been staked in BSC. Data is pulled from:"https://ss.belt.fi/info/all.json".',
    bsc: {
        tvl: bscTvl,
        staking: () => getStaking('bsc'),
    },
    heco: {
        tvl: hecoTvl,
    },
    klaytn: {
        tvl: klaytnTvl,
    },
}
