const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { default: BigNumber } = require('bignumber.js');
const { ASSETS } = require('./collaterals');
const { polygonReservesAddr } = require('./polygon');

/**
 * LaDAO (https://ladao.club/) is the organization that created and 
 * mantains the Xocolatl protocol.
 * $XOC is the first decentralized stablecoin with close peg to the mexican (MXN) peso.
 * The Xocolatl-protocol (https://github.com/La-DAO/xocolatl-contracts) is the system that 
 * allows $XOC to be minted or burned
 * using overcollateralization of crypto assets.
 * Mint some $XOC in our app (https://xocolatl.finance/)
 */

// Mainnet Addresses
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

/**
 * 
 * @param {*} collateral erc20 contract address
 * @param {*} reserves array of HouseOfReserve contracts that hold the `collateral` type
 * @param {*} block to query
 * @param {*} chain chain to query
 * @returns The erc20-balanceOf the multiple Xocolatl HouseOfReserve contracts
 */
const collateralSupply = async (collateral, reserves, block, chain) => {
  const responses = await sdk.api.abi.multiCall(
    {
      abi: abi.balanceOf,
      calls: (reserves).map(reserve => ({
        target: (collateral.address),
        params: [reserve.address]
      })),
      block,
      chain
    }
  );
  const supply = responses.output.reduce(
    (sum, response) => sum.plus(response.output),
    BigNumber(0)
  )
  return supply;
}

async function polygon(_timestamp, ethBlock, chainBlocks) {
  const wethSupplies = await collateralSupply(
    ASSETS.polygon.weth,
    polygonReservesAddr.weth,
    chainBlocks.polygon,
    "polygon"
  );

  return {
    [weth]: wethSupplies,
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Counts all the tokens being used as collateral in the House of Reserves contracts that back $XOC. $XOC is the first decentralized stablecoin with peg close to the mexican (MXN) peso.",
  polygon: {
    tvl: polygon
  },
}