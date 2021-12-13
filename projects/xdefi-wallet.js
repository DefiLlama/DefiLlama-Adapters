const {pool2} = require('./helper/pool2')

const xdefi_weth_slp = '0x37fc088cfd67349be00f5504d00ddb7f2274b3f6'
const masterchef = '0xef0881ec094552b2e128cf945ef17a6752b4ec5d'

module.exports={
    methodology: 'xDefi token can be LP\'ed on Sushi and LP can be staked on Sushiswap Masterchef - and soon rebate vault and Pylon',
    ethereum:{
        tvl: () => ({}),
        pool2: pool2(masterchef, xdefi_weth_slp, 'ethereum'),
    }
}
