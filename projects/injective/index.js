const sdk = require('@defillama/sdk')

const inj = '0xe28b3b32b6c345a34ff64674606124dd5aceca30'
const holder = '0x53f2b8cc450679d04c479a048dc3ff39a4D20D13'
async function tvl(_timestamp, ethBlock){
    return {
        [inj]: (await sdk.api.erc20.balanceOf({
            target: inj,
            owner: holder,
            block: ethBlock
        })).output
    }
}

module.exports = {
    tvl
}