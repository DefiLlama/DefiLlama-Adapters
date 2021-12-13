const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const BigNumber = require('bignumber.js')

const ETHER = new BigNumber(10).pow(18)

const dashboardBsc = '0x3BF0EbF0B846Fff73Df543bACacC542A6CE9fc15'
const qTokensBsc = [
    '0xbE1B5D17777565D67A5D2793f879aBF59Ae5D351', // qBNB
    '0xd055D32E50C57B413F7c2a4A052faF6933eA7927', // qBTC
    '0xb4b77834C73E9f66de57e6584796b034D41Ce39A', // qETH
    '0x1dd6E079CF9a82c91DaF3D8497B27430259d32C2', // qUSDC
    '0x99309d2e7265528dC7C3067004cC4A90d37b7CC3', // qUSDT
    '0x474010701715658fC8004f51860c90eEF4584D2B', // qDAI
    '0xa3A155E76175920A40d2c8c765cbCB1148aeB9D1', // qBUSD
    '0xaB9eb4AE93B705b0A74d3419921bBec97F51b264', // qCAKE
    '0xFF858dB0d6aA9D3fCA13F6341a1693BE4416A550', // qMDX
    '0xcD2CD343CFbe284220677C78A08B1648bFa39865'  // qQBT
]

const dashboardKlaytn = '0x9A47D707FDffC561E3598990f25d3874af448568'
const qTokensKlaytn = [
    '0xf6FB6Ce9dcc5Dac5BE99503B44630FfF1f24b1EC', // qKLAY
    '0xE61688286f169A88189E6Fbe5478B5164723B14A', // qKUSDT
    '0xb3e0030557CeC1CEf43062F71c2bE3b5f92f1B7b', // qKETH
    '0x19e1e58d9EdFdDc35D11bEa53BCcf8Eb1425Bf0D', // qKWBTC
    '0x0EaAAEB0623f6E263d020390e01d00a334EB531E', // QKDAI
    '0xC1c3a6b591a493c01B1330ee744d2aF01F70EA32', // QKSP
    '0x99dac5dF97eB189Cd244c5bfC8984f916f0eb4B0', // qWEMIX
    '0x3dB032090A06e3dEaC905543C0AcC92B8f827a70'  // qKQBT
]

function tvl(borrowed) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const chain = 'bsc'
        const block = chainBlocks[chain]
        const balances = {}
        
        async function bsc(timestamp, ethBlock, chainBlock) {
            const block = chainBlock.bsc
            const total = (await sdk.api.abi.multiCall({
                calls: qTokensBsc.map(address => ({
                    target: dashboardBsc,
                    params: [[address]]
                })),
                block,
                abi: abi,
                chain: 'bsc'
            })).output.reduce((tvl, call) => tvl.plus(new BigNumber(call.output)), ZERO)
            
            return {
                'tether': total.dividedBy(ETHER).toNumber()
                
            }
            
            return balances
        }
    }
}

async function klaytn() {
    const Web3 = require('web3')
    const provider = new Web3(new Web3.providers.HttpProvider('http://175.209.78.135:8551'))
    const dashboard = new provider.eth.Contract(require('./abiKlaytn.json'), dashboardKlaytn)
    const total = await dashboard.methods.totalValueLockedOf(qTokensKlaytn).call()
    
    return {
        'tether': (new BigNumber(total)).dividedBy(ETHER).toNumber()
    }
}

module.exports = {
    methodology: 'Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending',
    misrepresentedTokens: true,
    bsc: {
        tvl: bsc
    },
    klaytn: {
        tvl: klaytn
    },
    tvl: sdk.util.sumChainTvls([bsc, klaytn])
}