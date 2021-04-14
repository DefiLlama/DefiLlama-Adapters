/*==================================================
  Modules
==================================================*/

const sdk = require('@defillama/sdk');
const _ = require('underscore');
const BigNumber = require('bignumber.js');

const isWhitelistedCollateral = require('./abis/gamma/isWhitelistedCollateral.json');

/*==================================================
  Settings
==================================================*/

const START_BLOCK = 11551118;
const whitelist = "0xa5ea18ac6865f315ff5dd9f1a7fb1d41a30a6779";
const marginPool = "0x5934807cc0654d46755ebd2848840b616256c6ef";

/*==================================================
  TVL
==================================================*/

module.exports = async function tvl(timestamp, block) {  
  let balances = {};

  if(block >= START_BLOCK) {
    const supportedTokens = await (
      sdk
        .api
        .util
        .tokenList()
        .then((supportedTokens) => supportedTokens.map(({ contract }) => contract))
    );
    
    // get ETH balance
    const balance = (await sdk.api.eth.getBalance({target: marginPool, block})).output;
    balances["0x0000000000000000000000000000000000000000"] = BigNumber(balances["0x0000000000000000000000000000000000000000"] || 0).plus(BigNumber(balance)).toFixed();
  
    await Promise.all(supportedTokens.map(async (pulseToken) => {
      const collateralAsset = pulseToken.toLocaleLowerCase();

      if(collateralAsset.substring(0, 2) == "0x" && collateralAsset != "0x0000000000000000000000000000000000000000") {
        let isWhitelistedCollateralToken = (
          await sdk.api.abi.call({
            target: whitelist,
            abi: isWhitelistedCollateral,
            params: [collateralAsset],
            fromBlock: START_BLOCK,
            toBlock: block
          })
        ).output;
    
        if(isWhitelistedCollateralToken) {
          const balanceOfResult = (
            await sdk.api.abi.call({
              target: collateralAsset,
              params: marginPool,
              abi: 'erc20:balanceOf',
              block
            })
          ).output;

          balances[collateralAsset] = BigNumber(balances[collateralAsset] || 0).plus(BigNumber(balanceOfResult)).toFixed();          
        }
      }
    }));
  }

  return balances;
}