const sdk = require("@defillama/sdk");

const RAFT_POSITION_MANAGER = '0x5f59b322eb3e16a0c78846195af1f588b77403fc';
const WSTETH_ADDRESS = '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0';

async function tvl(timestamp, block) {
    let balances = {};
    const lockedBalance = (
    await sdk.api.abi.call({
        target: WSTETH_ADDRESS,
        abi: 'erc20:balanceOf',
        params: [RAFT_POSITION_MANAGER],
        block
    })
    ).output

    sdk.util.sumSingleBalance(
      balances,
      WSTETH_ADDRESS,
      lockedBalance
    );
  
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  }
};
