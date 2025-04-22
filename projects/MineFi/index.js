const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const MINEFI_CONTRACT = "0xeCa50369cb0cDBaE173C9c81c1B48212adc4b501";

async function tvl(api) {

  const collateralBalance = await api.call({
    abi: 'function getTvl() external view returns (uint256)',
    target: MINEFI_CONTRACT,
  });

  api.add(ADDRESSES.null,collateralBalance)
}



module.exports = {
  timetravel: false,
    methodology: 'counts the number of pledge filecoins in the minefi contract',
  filecoin: {
    tvl
  }
};