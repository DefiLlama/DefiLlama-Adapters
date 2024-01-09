

const sdk = require ("@defillama/sdk")


const ADFSeedingContract = "0x2f6f2DBF7d7Cc69e676b3647543fC8E1e3D9Dd6f";


const getRoundInfo = async () => {

    const roundInfo = (await sdk.api.abi.call({
        abi : "uint256:currentRound",
        chain : 'polygon',
        target : ADFSeedingContract,
    })).output;

    return roundInfo;
}


async function tvl (ts , block) {
    let currentRound = await getRoundInfo();
    const tvl = {};
    const totalTVL = (
        await sdk.api.abi.call({
        abi : "function getRoundInfo (uint256 round) public view returns (tuple(bool _roundStatus , uint256 _tierCount , uint256 _roundStartTime , uint256 _roundEndTime , uint256 _totalSeeding , uint256 _roundReward , uint256 _claimReward))",
        chain : 'polygon',
        target : ADFSeedingContract,
        params : currentRound,
        })
    ).output._totalSeeding;

    tvl['art-de-finance'] = totalTVL/1e18;

    return tvl;
}


module.exports = {
    methodology:
        "Total Value Staked on Seeding function of Artiside, powered by Art de Finance, is calculated by the sum of $ADF staked in the artist pool.",
    polygon : {
        tvl
    }
}

