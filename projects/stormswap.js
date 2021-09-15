const sdk = require("@defillama/sdk");
const { transformAvaxAddress } = require("./helper/portedTokens");
const {addFundsInMasterChef} = require('./helper/masterchef');
const STAKING_CONTRACT = "0xc1A97bCbaCf0566fc8C40291FFE7e634964b0446";

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformAvaxAddress();
  await addFundsInMasterChef(
      balances, STAKING_CONTRACT, chainBlocks.avax, 'avax', transformAddress);

  return balances;
};
// node test.js projects/stormswap.js
module.exports={
    staking:{
        tvl: avaxTvl
    }
}