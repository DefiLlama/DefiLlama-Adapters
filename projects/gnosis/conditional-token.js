/*==================================================
  Modules
==================================================*/

const { api: { abi, util } } = require('@defillama/sdk');

/*==================================================
  Settings
==================================================*/

const START_BLOCK = 8623608;
const PROTOCOL_ADDRESS = '0xc59b0e4de5f1248c1140964e0ff287b192407e0c';
const TOKENS_TO_IGNORE = new Set();

/*==================================================
  Helper Functions
==================================================*/

const getTokenAddressFromLogData = data => '0x' + data.substring(26, 66);

const getCallDataOfErc20Token = (tokenAddress, atThisBlock) =>
  ({
    target: tokenAddress,
    params: PROTOCOL_ADDRESS,
    abi: 'erc20:balanceOf',
    block: atThisBlock,
  });


/*==================================================
  Main
==================================================*/

async function tvl(_, block) {
  // Snag all token addresses that have been listed on Gnosis Conditional Token
  const { output: events } = await util.getLogs({
    keys: [],
    toBlock: block,
    target: PROTOCOL_ADDRESS,
    fromBlock: START_BLOCK,
    topic: "PositionSplit(address,address,bytes32,bytes32,uint256[],uint256)",
  });

  // 1. Reduce all TokenListing logs into an array of token addresses from the log data
  // 2. Remove any tokens we want to ignore as denoted top of file
  // 3. Format to pipe into erc20:balanceOf multiCall
  const tokenList = events.reduce((acc, { data }) => {
    const tokenAddress = getTokenAddressFromLogData(data);
    if (TOKENS_TO_IGNORE.has(tokenAddress)) return acc;
    // add it to de-dupe
    TOKENS_TO_IGNORE.add(tokenAddress);
    const tokenWithCallData = getCallDataOfErc20Token(tokenAddress, block);
    return acc.concat(tokenWithCallData)
  }, []);
  
  // [0] Batch call all ERC20 balances from the Gnosis Conditional Token contract
  // [1] Resolve initial ethBalance promise
  const balances = await abi.multiCall({
    block,
    abi: 'erc20:balanceOf',
    calls: tokenList
  });

  return balances;
}

/*==================================================
  Exports
==================================================*/

module.exports = {
  tvl,
}
