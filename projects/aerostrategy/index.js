const ADDRESSES = require('../helper/coreAssets.json')
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');

// Legacy veAERO, kept so dates before the 2026-11-06 move to sAERO stay correct.
const AERO = ADDRESSES.base.AERO;
const veAERO = '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4';
const AEROSTRATEGY_BUYER = '0x047f7B059743EC2552f44F94A901a190b836d99B';
const AUTOPILOT = '0xA7c68a960bA0F6726C4b7446004FE64969E2b4d4';
const AEROSTRATEGY_veNFT_HOLDER = '0xE839A0356bA10957F9441bf52034Cc6D95FEAf83'; // treasury Safe
const AUTOPILOT_LOCK_MANAGER = '0x300D02c0B2b5321ACC4Cb9D067B22e7F48Ba2690'; // aerostrategy contract that held the treasury locks in Autopilot 2025-12-16 to 2026-03-31
const AUTOPILOT_USERS = [AEROSTRATEGY_veNFT_HOLDER, AUTOPILOT_LOCK_MANAGER];
const LOCK_MANAGER_OWNER = '0x14Ca8ee755a5FDC9A6a31dfE4B015B59507afe81'; // Safe with OWNER_ROLE on the lock manager, held the 34 locks on 2026-04-01
const FORTY_ACRES_V1_LOAN = '0x87f18b377e625b62c708D5f6EA96EC193558EFD0'; // held the treasury veAERO as collateral with the Safe as borrower
const FORTY_ACRES_V1_FROM_BLOCK = 43976527; // 2026-03-29
const FORTY_ACRES_V1_TO_BLOCK = 46093327; // 2026-05-17
const FORTY_ACRES_V1_MAX_NFTS = 3000; // ~1.4k held in the window

// sAERO stakes on the Aero VotingEscrow, valued as staked new AERO (no sAERO price).
// Deployment blocks: the token and the escrow did not exist before these.
const NEW_AERO = '0x3f5bF3EdAc59d650D8fDf9657a71F2f904A3a4Ee';
const NEW_AERO_FROM_BLOCK = 52688124;
const SAERO_VOTING_ESCROW = '0xBF7977E1521e9a3032bf7243Ee4712f311f13915';
const SAERO_FROM_BLOCK = 52688150;
const FORTY_ACRES_SAERO_WALLET = '0xb0d466a3D19B9C059ED81513F900E901D926De5F'; // 40acres account holding the treasury's sAERO
const OLD_FORTY_ACRES_WALLET = '0xa1cf9101dc67fab7c09357ef0d5946111fc481a4'; // earlier 40acres account (held veAERO before the move)
const BUYER_V2 = '0xa8857925b388F9C18814934a56eb6993711c2Dfb'; // reservoir: AERO waiting to buy sAERO
const SAERO_OWNERS = [AEROSTRATEGY_veNFT_HOLDER, FORTY_ACRES_SAERO_WALLET, OLD_FORTY_ACRES_WALLET];
const SAERO_STAKED_ABI = 'function staked(uint256) view returns (uint128 amount, uint48 end, bool isPermanent)';

async function fortyAcresV1Collateral(api) {
    const count = await api.call({ target: veAERO, abi: 'erc20:balanceOf', params: FORTY_ACRES_V1_LOAN });
    if (+count > FORTY_ACRES_V1_MAX_NFTS) throw new Error(`40acres v1 holds ${count} veAERO, above ${FORTY_ACRES_V1_MAX_NFTS}`);
    const idCalls = [...Array(+count).keys()].map(j => ({ params: [FORTY_ACRES_V1_LOAN, j] }));
    const ids = await api.multiCall({ target: veAERO, abi: 'function ownerToNFTokenIdList(address, uint256) view returns (uint256)', calls: idCalls });
    const loans = await api.multiCall({ target: FORTY_ACRES_V1_LOAN, abi: 'function getLoanDetails(uint256) view returns (uint256 balance, address borrower)', calls: ids });
    const treasuryIds = ids.filter((_, i) => loans[i].borrower.toLowerCase() === AEROSTRATEGY_veNFT_HOLDER.toLowerCase());
    return api.multiCall({ target: veAERO, abi: 'function locked(uint256) view returns (int128 amount, uint256 end, bool isPermanent)', calls: treasuryIds });
}

async function tvl(api) {
    await api.sumTokens({ owner: AEROSTRATEGY_BUYER, token: AERO });
    const lockCounts = await api.multiCall({
        target: AUTOPILOT,
        abi: 'function getUserLocksCount(address user) view returns (uint256)',
        calls: AUTOPILOT_USERS,
    });

    const userLocks = await api.multiCall({
        target: AUTOPILOT,
        abi: 'function getUserLocks(address user,uint256 offset, uint256 limit) view returns(tuple(uint256 lock_id,uint256 start_snapshot_id,uint256 rewards_snapshot_id, uint256 voting_power,uint256 postponed_rewards)[])',
        calls: AUTOPILOT_USERS.map((user, i) => ({ params: [user, 0, +lockCounts[i]] })),
    });

    userLocks.flat().forEach(nft => api.add(AERO, nft.voting_power));

    for (const owner of [AEROSTRATEGY_veNFT_HOLDER, OLD_FORTY_ACRES_WALLET, AUTOPILOT_LOCK_MANAGER, LOCK_MANAGER_OWNER])
        await unwrapSolidlyVeNft({ api, baseToken: AERO, veNft: veAERO, owner });

    const block = await api.getBlock();

    if (block >= FORTY_ACRES_V1_FROM_BLOCK && block <= FORTY_ACRES_V1_TO_BLOCK) {
        const collateral = await fortyAcresV1Collateral(api);
        collateral.forEach(lock => api.add(AERO, lock.amount));
    }

    // Old and new AERO in the BuyerV2 reservoir, not yet used to buy sAERO.
    const reservoirTokens = [AERO];
    if (block >= NEW_AERO_FROM_BLOCK) reservoirTokens.push(NEW_AERO);
    await api.sumTokens({ owner: BUYER_V2, tokens: reservoirTokens });

    // Skip blocks from before the escrow existed. After that, a failed call must throw
    // rather than drop the stakes.
    if (block < SAERO_FROM_BLOCK) return;

    const counts = await api.multiCall({ abi: 'erc20:balanceOf', calls: SAERO_OWNERS, target: SAERO_VOTING_ESCROW });
    const idCalls = [];
    counts.forEach((count, i) => {
        for (let j = 0; j < +count; j++) idCalls.push({ params: [SAERO_OWNERS[i], j] });
    });
    if (!idCalls.length) return;

    const stakeIds = await api.multiCall({ abi: 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)', calls: idCalls, target: SAERO_VOTING_ESCROW });
    const staked = await api.multiCall({ abi: SAERO_STAKED_ABI, calls: stakeIds, target: SAERO_VOTING_ESCROW });
    staked.forEach(i => api.add(NEW_AERO, i.amount));
}

module.exports = {
    base: { tvl },
    doublecounted: true,
    methodology: `TVL counts AERO held by Aerostrategy: sAERO stakes owned by the treasury and its 40acres accounts (counted as staked AERO), AERO in the BuyerV2 reservoir waiting to buy sAERO, and the treasury's legacy veAERO for dates before the move to sAERO, whether held directly, deposited in Autopilot by the treasury or its lock manager, or posted as 40acres collateral.`,
};
