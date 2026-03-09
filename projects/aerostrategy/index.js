const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');

const AERO = '0x940181a94A35A4569E4529A3CDfB74e38FD98631';
const veAERO = '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4';
const AEROSTRATEGY_BUYER = '0x047f7B059743EC2552f44F94A901a190b836d99B';
const AUTOPILOT = '0xA7c68a960bA0F6726C4b7446004FE64969E2b4d4';
const AEROSTRATEGY_veNFT_HOLDER = '0xE839A0356bA10957F9441bf52034Cc6D95FEAf83';


async function tvl(api) {
    await api.sumTokens({ owner: AEROSTRATEGY_BUYER, token: AERO });
    const totalNftsLocked = await api.call({
        target: AUTOPILOT,
        abi: 'function getUserLocksCount(address user) view returns (uint256)',
        params: AEROSTRATEGY_veNFT_HOLDER
    });

    const lockedVeNfts = await api.call({
        target: AUTOPILOT,
        abi: 'function getUserLocks(address user,uint256 offset, uint256 limit) view returns(tuple(uint256 lock_id,uint256 start_snapshot_id,uint256 rewards_snapshot_id, uint256 voting_power,uint256 postponed_rewards)[])',
        params: [AEROSTRATEGY_veNFT_HOLDER, 0, +totalNftsLocked]
    });

    lockedVeNfts.forEach(nft => api.add(AERO, nft.voting_power));

    await unwrapSolidlyVeNft({ api, baseToken: AERO, veNft: veAERO, owner: AEROSTRATEGY_veNFT_HOLDER });
}

module.exports = {
    base: { tvl },
    doublecounted: true,
    methodology: `TVL includes aerostrategy's veAero locked in autopilot, unlocked veAero and the AERO yet to be allocated to veAero.`,
};