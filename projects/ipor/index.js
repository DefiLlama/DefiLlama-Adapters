const sdk = require('@defillama/sdk');
const {abi} = require("./abi");
const {BigNumber} = require("ethers");

const underlyings = [
    {
        symbol: "USDT",
        underlyingAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        miltonAddress: "0x28BC58e600eF718B9E97d294098abecb8c96b687",
        underlyingDecimals: 6,
        outputDecimals: 18,
    },
    {
        symbol: "USDC",
        underlyingAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        miltonAddress: "0x137000352B4ed784e8fa8815d225c713AB2e7Dc9",
        underlyingDecimals: 6,
        outputDecimals: 18,
    },
    {
        symbol: "DAI",
        underlyingAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        miltonAddress: "0xEd7d74AA7eB1f12F83dA36DFaC1de2257b4e7523",
        underlyingDecimals: 18,
        outputDecimals: 18,
    },
];

function calculateTvl() {
    return async (timestamp, block) => {
        const balances = {};

        (await sdk.api.abi.multiCall({
                abi: abi.getAccruedBalance,
                block,
                calls: Array.from(underlyings).map((underlying, i) => ({
                    target: underlying.miltonAddress,
                    params: []
                })),
            })
        ).output.forEach(assetBalances => {
            const balanceOfUnderlying = BigNumber.from(assetBalances.output.totalCollateralPayFixed)
                .add(BigNumber.from(assetBalances.output.totalCollateralReceiveFixed))
                .add(BigNumber.from(assetBalances.output.liquidityPool));
            const underlying = underlyings.find(({miltonAddress}) => miltonAddress === assetBalances.input.target);
            const decimalPlacesToReduce = underlying.outputDecimals - underlying.underlyingDecimals;
            const balanceDivisor = BigNumber.from("10").pow(decimalPlacesToReduce);
            sdk.util.sumSingleBalance(balances, underlying.underlyingAddress, balanceOfUnderlying.div(balanceDivisor).toString())
        });

        return balances;
    }
}

module.exports = {
    timetravel: true,
    methodology: `Counts the tokens locked in the AMM contracts to be used as collateral to Interest Rate Swaps derivatives, counts tokens provided as a liquidity to Liquidity Pool, counts interest gathered via Asset Manager in external protocols.`,
    ethereum: {
        tvl: calculateTvl()
    }
};
