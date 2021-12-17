const {pool2} = require('./helper/pool2')

const RADAR = '0x44709a920fccf795fbc57baa433cc3dd53c44dbe'
const RADAR_WETH_sushi = '0x559ebe4e206e6b4d50e9bd3008cda7ce640c52cb'
const sushiMasterchef = '0xef0881ec094552b2e128cf945ef17a6752b4ec5d'

module.exports={
    methodology: 'RADAR token can be LP\'ed on Sushi and LP can be staked on Sushiswap Masterchef - more TVL soon',
    ethereum:{
        tvl: () => ({}),
        pool2: pool2(sushiMasterchef, RADAR_WETH_sushi, 'ethereum'),
    }
}
