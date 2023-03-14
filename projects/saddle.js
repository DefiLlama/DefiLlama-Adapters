const sdk = require('@defillama/sdk');
console.log("buh")

async function getPoolsLength() {
    const poolLength = await sdk.api.abi.call({
      abi: 'uint256:getPoolsLength',
      target: "0xFb4DE84c4375d7c8577327153dE88f58F69EeC81",
    })
    console.log("poolLength: ", poolLength)
    return poolLength
  }

module.exports = {
    ethereum:{
        getPoolsLength
    },
    methodology: "Counts tokens on the treasury for tvl and staked CROWN for staking",
};
