const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  // WETH ERC20 contract
  const weth = ADDRESSES.ethereum.WETH;

  // Contract holding all of the WETH balance in the system
  const ethCollateralJoin = "0x2D3cD7b81c93f188F3CB8aD87c8Acc73d6226e3A";

  const balance = (
    await sdk.api.erc20.balanceOf({
      target: weth,
      owner: ethCollateralJoin,
      block,
    })
  ).output;

  return { [weth]: balance };
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  start: '2021-02-17',
  ethereum: { tvl },
};
