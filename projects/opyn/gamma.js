const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const START_BLOCK = 11551118;
const whitelist = "0xa5ea18ac6865f315ff5dd9f1a7fb1d41a30a6779";
const marginPool = "0x5934807cc0654d46755ebd2848840b616256c6ef";
const yvUSDC = "0x5f18c75abdae578b483e5f43f12a39cf75b973a9";
const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const sdeCRV = "0xa2761B0539374EB7AF2155f76eb09864af075250".toLowerCase();
const sdcrvWSBTC = "0x24129b935aff071c4f0554882c0d9573f4975fed".toLowerCase();
const sdcrvFrax = "0x5af15da84a4a6edf2d9fa6720de921e1026e37b7".toLowerCase();
const frax = "0x853d955acef822db058eb8505911ed77f175b99e".toLowerCase();
const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'.toLowerCase();
const ETH = '0x0000000000000000000000000000000000000000'.toLowerCase();

function toAddress(str, skip = 0) {
  return `0x${str.slice(64 - 40 + 2 + skip * 64, 64 + 2 + skip * 64)}`.toLowerCase();
}

const yvUSDC2="0xa354f35829ae975e850e23e9615b11da1b3dc4de"

const transforms = {
  [yvUSDC]:usdc,
  [sdeCRV]:ETH,
  // [sdcrvWSBTC]: WBTC,
  [yvUSDC2]:usdc,
  [sdcrvFrax]: frax
}

const transform = addr=>transforms[addr]??addr

module.exports.tvl = async function tvl(timestamp, block) {  
  let balances = {};

  if(block >= START_BLOCK) {
    // get ETH balance
    const balance = (await sdk.api.eth.getBalance({target: marginPool, block})).output;
    balances[ETH] = BigNumber(balances[ETH] || 0).plus(BigNumber(balance)).toFixed();
    
    const whitelistedCollaterals = await sdk.api.util.getLogs({
      target: whitelist,
      topic: 'CollateralWhitelisted(address)',
      keys: [],
      fromBlock: 11544457,
      toBlock: block
    })
  
    const balanceCalls = []

    whitelistedCollaterals.output.forEach(async (log) => {
      const collateralAsset = toAddress(log.topics[1]).toLowerCase();
      
      const ignored = [ETH, sdcrvWSBTC]
      if(!ignored.includes(collateralAsset)) {
        balanceCalls.push({
          target: collateralAsset,
          params: marginPool
        })
      }
    });

    const balanceOfs = await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: balanceCalls,
      block
    })

    sdk.util.sumMultiBalanceOf(balances, balanceOfs, true, transform)

    // Add sdcrvWSBTC as WBTC to balances
    const sdcrvWSBTCBalance = (
      await sdk.api.abi.call({
        target: sdcrvWSBTC,
        params: marginPool,
        abi: 'erc20:balanceOf',
        block
      })
    ).output;

    balances[WBTC] = BigNumber(balances[WBTC] || 0).plus(BigNumber(sdcrvWSBTCBalance / 10 ** 10)).toFixed(0);

  }

  return balances;
}