const sdk = require('@defillama/sdk');
const getReserves = require('../helper/abis/getReserves.json');
const { getBlock } = require('../helper/getBlock');
const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

function calculateUsdUniTvlForBenSwapSmartBCH () {
    const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
    const EBEN = "0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B";
    const FACTORY = "0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D";
    const MASTERBREEDER = "0xDEa721EFe7cBC0fCAb7C8d65c598b21B6373A2b6";
    const EBEN_WBCH_LP = "0x0D4372aCc0503Fbcc7EB129e0De3283c348B82c3";
    const COREASSETNAME = "bitcoin-cash";
    const CHAIN = "smartbch";

    const originalFunc = calculateUsdUniTvl(FACTORY, CHAIN, WBCH, [EBEN], COREASSETNAME);

    return async (timestamp, ethBlock, chainBlocks) => {
        const originalResult = await originalFunc(timestamp, ethBlock, chainBlocks);

        const block = await getBlock(timestamp, CHAIN, chainBlocks);
        const reserveAmounts = (await sdk.api.abi.call({
            target: EBEN_WBCH_LP,
            abi: getReserves,
            chain: CHAIN,
            block
        })).output;
        const ebenPricePerBCH = Number(reserveAmounts[1]) / Number(reserveAmounts[0])

        const stakedEBEN = (await sdk.api.erc20.balanceOf({
            target: EBEN,
            owner: MASTERBREEDER,
            chain: CHAIN,
            block: block,
            decimals: 18
        })).output;
        const stakedBCH = (await sdk.api.erc20.balanceOf({
            target: WBCH,
            owner: MASTERBREEDER,
            chain: CHAIN,
            block: block,
            decimals: 18
        })).output;

        return {
            [COREASSETNAME] : originalResult[COREASSETNAME] + Number(stakedBCH) + Number(stakedEBEN) / ebenPricePerBCH
        }
    }
}

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D) is used to find the LP pairs on smartBCH and Factory address (0x4dC6048552e2DC6Eb1f82A783E859157d40FA193) is used to find the liquidity of the pairs on BSC. TVL is equal to the liquidity on both AMMs plus the extra staking balance (staking balance only works on SmartBCH for now).",
    smartbch: {
        tvl:calculateUsdUniTvlForBenSwapSmartBCH(),
      
    },
    bsc: {
        tvl:calculateUsdUniTvl("0x4dC6048552e2DC6Eb1f82A783E859157d40FA193", "bsc", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", ["0x8173dDa13Fd405e5BcA84Bd7F64e58cAF4810A32"], "binancecoin"),
    },
}
