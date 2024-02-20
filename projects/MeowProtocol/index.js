const sdk = require('@defillama/sdk');
const { util: {
    blocks: { getCurrentBlocks },
  } } = require("@defillama/sdk");

async function getAssets(lendingPoolCore, block, chain) {
    const reserves = (
        await sdk.api.abi.call({
            target: lendingPoolCore,
            abi: "address[]:getReserves",
            block,
            chain
        })
    ).output;

    return reserves
}

const ethReplacement = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

async function multiMarketTvlBorrowed(balances, lendingPoolCore, block, chain, eth) {
    const reserves = await getAssets(lendingPoolCore, block, chain);
    const totalBorrowed = await sdk.api.abi.multiCall({
        block,
        calls: reserves.map((reserve) => ({
            target: lendingPoolCore,
            params: reserve,
        })),
        abi: "function getReserveTotalBorrows(address _reserve) view returns (uint256)",
        chain
    });
    totalBorrowed.output.forEach(borrowed=>{
        const token = borrowed.input.params[0]
        sdk.util.sumSingleBalance(balances, token === ethReplacement?eth:token, borrowed.output)
    })
    return balances;
}

async function depositMultiMarketTvl(balances, lendingPoolCore, block, chain, eth) {
    const reserves = (await getAssets(lendingPoolCore, block, chain)).filter(reserve => reserve !== ethReplacement);

    sdk.util.sumSingleBalance(balances, eth, (await sdk.api.eth.getBalance({ target: lendingPoolCore, block, chain })).output)

    const balanceOfResults = await sdk.api.abi.multiCall({
        block,
        calls: reserves.map((reserve) => ({
            target: reserve,
            params: lendingPoolCore,
        })),
        abi: "erc20:balanceOf",
        chain,
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true);
    return balances;
}

function multiMarketTvl(balances, lendingPoolCore, block, borrowed, chain, eth = "0x0000000000000000000000000000000000000000") {
    return (borrowed?multiMarketTvlBorrowed:depositMultiMarketTvl)(balances, lendingPoolCore, block, chain, eth)
}

async function singleAssetV1Market(balances, lendingPoolCore, block, borrowed, chain, eth) {
    return multiMarketTvl(balances, lendingPoolCore, block, borrowed, chain, eth);
}

const EthereumContractAddress = "0x9aE578d5ad69B051E6FbC7EBB18A12C2D459D914";
const ScrollContractAddress = "0x4b71CAF14Cf8529101498976C44B8445797A5886";

function getMarket(borrowed, contractAddress, chain) {
  return async (timestamp, block)=> {
    const balances = {}
    if(chain == "scroll"){
        const { chainBlocks } = await getCurrentBlocks([]); // fetch only ethereum block for local test
        block = chainBlocks.scroll
    }

    await singleAssetV1Market(balances, contractAddress, block, borrowed,chain)
    return balances
  }
}

module.exports = {
    scroll: {
      tvl: getMarket(false,ScrollContractAddress,"scroll"),
      borrowed: getMarket(true,ScrollContractAddress,"scroll"),
    },
    ethereum:{
        tvl: getMarket(false,EthereumContractAddress,"ethereum"),
        borrowed: getMarket(true,EthereumContractAddress,"ethereum"),
    }
};