const sdk = require("@defillama/sdk");


const LPContract = '0xac004b512c33D029cf23ABf04513f1f380B3FD0a'
const token = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'

async function tvl(timestamp, ethBlock, chainBlocks) {

  const balance = await sdk.api.erc20.balanceOf({
    target: token,
    owner: LPContract,
    block: chainBlocks['xdai'],
    chain: 'xdai'
  })

  return {['xdai:' + token]: balance.output};
}


module.exports = {
  xdai:{
    tvl,
  },
  methodology: `TVL is the total quantity of xDAI held on Liquidity pools’ smart-contracts.`
}
