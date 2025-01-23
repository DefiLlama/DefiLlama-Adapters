const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const LETSFIL_CONTRACT = "0xeD02FD25CA54e06dE121BFD36764C9f65CB6A183";


async function tvl(api) {

  const collateralBalance = await api.call({
    abi: 'function getTvl() external view returns (uint256)',
    target: LETSFIL_CONTRACT,
  });

  // await sdk.util.sumSingleBalance(balances, LETSFIL_CONTRACT, collateralBalance, api.chain)
  // return balances;

  api.add(ADDRESSES.null,collateralBalance)
}



module.exports = {
  timetravel: false,
    methodology: 'counts the number of pledge filecoins in the letsfil contract',
  filecoin: {
    tvl
  }
};
