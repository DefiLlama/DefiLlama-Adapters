const {addFundsInMasterChef} = require('../helper/masterchef')
const sdk = require('@defillama/sdk')
const {staking} = require('../helper/staking')
const {transformFantomAddress} = require('../helper/portedTokens')
const poolInfoAbi = require('./abi.json')

const tusd = "0x0000000000085d4780b73119b644ae5ecd22b376"
const ifusd = "0x9fC071cE771c7B27b7d9A57C32c0a84c18200F8a"

async function tvl(_t, _b, chainBlocks){
    const block = chainBlocks.fantom
    const fusd = await sdk.api.erc20.balanceOf({
        target: '0xad84341756bf337f5a0164515b1f6f993d194e1f',
        owner: ifusd,
        block,
        chain: 'fantom'
    })
    const balances = {
        [tusd]: fusd.output
    }
    const transform = await transformFantomAddress()
    await addFundsInMasterChef(balances, '0x5bC37CAAA3b490b65F5A50E2553f4312126A8b7e', block, 'fantom', transform, poolInfoAbi, [ifusd])
    return balances
}

module.exports={
    methodology: 'TVL counts the fUSD deposited to creat ifUSD and the tokens in the masterchef. Steak is counted towards staking and TUSD is used to represent fUSD since fUSD is not on CoinGecko.',
    staking:{
        tvl: staking('0xb632c5d42BD4a44a617608Ad1c7d38f597E22E3C', '0x05848b832e872d9edd84ac5718d58f21fd9c9649', 'fantom'),
    },
    tvl,
}