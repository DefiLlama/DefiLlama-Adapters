const { tombTvl } = require("../helper/tomb");
const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk');
const getReserves = require('../helper/abis/getReserves.json');
const token0Abi = require('../helper/abis/token0.json');
const token1Abi = require('../helper/abis/token1.json');

const game = "0x56EbFC2F3873853d799C155AF9bE9Cb8506b7817";
const hodl = "0xFfF54fcdFc0E4357be9577D8BC2B4579ce9D5C88";
const theory = "0x60787C689ddc6edfc84FCC9E7d6BD21990793f06";
const master = "0x83641AA58E362A4554e10AD1D120Bf410e15Ca90";
const theoryRewardPool = "0x820c3b6d408Cff08C8a31C9F1461869097ba047c";
const theoretics = "0x670433FB874d4B7b94CF1D16E95fa241474E6787";
const treasury = "0x98F5cdda1489503e755Da30BEc5FCD341C949791";

const lps = [
    "0x168e509FE5aae456cDcAC39bEb6Fd56B6cb8912e",
    "0xF69FCB51A13D4Ca8A58d5a8D964e7ae5d9Ca8594"
];

async function determineStakingBalanceFromAmount(bal, block, stakingToken, chain, lpContract, decimals) {
    const [reserveAmounts, token0, token1] = await Promise.all([
        ...[getReserves, token0Abi, token1Abi].map(abi=>sdk.api.abi.call({
            target: lpContract,
            abi,
            chain,
            block
        }).then(o=>o.output))
    ])
    let token, stakedBal;
    if(token0.toLowerCase() === stakingToken.toLowerCase()){
        token = token1;
        stakedBal = BigNumber(bal).times(reserveAmounts[1]).div(reserveAmounts[0]).toFixed(0);
    }else {
        stakedBal = BigNumber(bal).times(reserveAmounts[0]).div(reserveAmounts[1]).toFixed(0);
        token = token0
    }
    if(decimals !== undefined){
        stakedBal = Number(stakedBal)/(10**decimals)
    }
    return stakedBal;
}

function getTvl()
{
    var tvl = tombTvl(game, theory, theoryRewardPool, theoretics, lps, "fantom", undefined, false, lps[1]);
    var oldStaking = tvl["fantom"]["staking"]; //Liquidity pools and theoretics
    const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'; //DAI on Ethereum (transformed DAI)
    tvl["fantom"]["staking"] = async (timestamp, _ethBlock, chainBlocks) => {
        const stakingValue = await oldStaking(timestamp, _ethBlock, chainBlocks);
        let totalStaking = new BigNumber(stakingValue[DAI]);

        //Get MASTER TVL in DAI
        const masterSupply = (
        await sdk.api.erc20.totalSupply({
          target: master,
          block: chainBlocks["fantom"],
          chain: "fantom",
        })
        ).output;
        const masterToTheory = (await sdk.api.abi.call({
            abi: {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_share",
                    "type": "uint256"
                }
            ],
            "name": "masterToTheory",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
            chain: "fantom",
            target: master,
            params: [masterSupply],
            block: chainBlocks["fantom"],
        })).output;
        const theoryBalanceForMaster = await determineStakingBalanceFromAmount(masterToTheory, chainBlocks["fantom"], theory, "fantom", lps[1]);

        totalStaking = totalStaking.plus(theoryBalanceForMaster);

        //Get HODL TVL in DAI (HODL only counts if staked since it is only locked when under peg)
        const bondRatioBN = (await sdk.api.abi.call({
            abi: {
                "inputs": [],
                "name": "getBondPremiumRate",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "_rate",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            chain: "fantom",
            target: treasury,
            block: chainBlocks["fantom"],
        })).output;
        const one = new BigNumber(10).pow(18);
        const modifier = BigNumber(bondRatioBN).gt(one) ? bondRatioBN : one;

        const balanceOfHodl = (
            await sdk.api.erc20.balanceOf({
                target: hodl,
                owner: theoryRewardPool,
                chain: "fantom",
                block: chainBlocks["fantom"],
            })
        ).output;

        const hodlToGame = BigNumber(balanceOfHodl).times(modifier).div(one);
        const gameBalanceForHodl = await determineStakingBalanceFromAmount(hodlToGame, chainBlocks["fantom"], game, "fantom", lps[0]);
        totalStaking = totalStaking.plus(gameBalanceForHodl);

        stakingValue[DAI] = totalStaking;
        return stakingValue;
    };
    return tvl;
}

module.exports = {
    ...getTvl()
}