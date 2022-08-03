const sdk = require('@defillama/sdk');
const { calculateUsdUniTvlPairs } = require('../helper/getUsdUniTvl')
const { staking } = require('../helper/staking')

const civFarmContract = "0x8a774F790aBEAEF97b118112c790D0dcccA61099";
const stakingTokens = [
  "0x73a83269b9bbafc427e76be0a2c1a1db2a26f4c2",
  "0x37fe0f067fa808ffbdd12891c0858532cfe7361d",
  "0x6c406daeca809382e649d6c8f768450bf8dbc1dd",
  "0xa65653bb6e1338dbce69191bb1328700881fc051",
  "0xed247449a7ca06db5b27b44b2c092f0b48bbdb77",
];


const stonePoolTVL = staking(civFarmContract, stakingTokens[0], "ethereum")
const civPoolTVL = staking(civFarmContract, stakingTokens[1], "ethereum")
const stoneEthTVL = staking(civFarmContract, stakingTokens[2], "ethereum")
const stoneCivTVL = staking(civFarmContract, stakingTokens[3], "ethereum")
const civEthTVL = staking(civFarmContract, stakingTokens[4], "ethereum")
const totalTVLs = sdk.util.sumChainTvls([stonePoolTVL, civPoolTVL,stoneEthTVL,stoneCivTVL,civEthTVL])

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl: totalTVLs
    },
}
