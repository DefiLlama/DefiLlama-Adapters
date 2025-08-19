const SILO_POOL_ADDRESSES = {
    'S-USDC-20': '0x322e1d5384aa4ED66AeCa770B95686271de61dc3',
    'S-USDC-8': '0x4E216C15697C1392fE59e1014B009505E05810Df',
    'wstkscUSD-USDC-23': '0x5954ce6671d97D24B782920ddCdBB4b1E63aB2De',
    'Anon-USDC-27': '0x7e88AE5E50474A48deA4c42a634aA7485e7CaA62',
    'x33-USDC-49': '0xa18a8f100f2c976044f2f84fae1eE9f807Ae7893',
    'PT-wstkscUSD (29 May)-USDC-34': '0x6030aD53d90ec2fB67F3805794dBB3Fa5FD6Eb64',
    'wstkscUSD-USDC-55': '0x4935FaDB17df859667Cc4F7bfE6a8cB24f86F8d0',
    'Varlamore USDC Growth': '0xF6F87073cF8929C206A77b0694619DC776F89885',
    'Re7 scUSD': '0x592D1e187729C76EfacC6dfFB9355bd7BF47B2a7',
    'Apostro - USDC': '0xcca902f2d3d265151f123d8ce8FdAc38ba9745ed',
    'Greenhouse USDC': '0xf6bC16B79c469b94Cdd25F3e2334DD4FEE47A581'

};
const AAVE_TOKEN_ADDRESS = '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6';
const EULER_POOL_ADDRESSES = {
    'MEV Capital Sonic Cluster USDC.e': '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
    'Re7 Labs Cluster USDC.e': '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
};
const PENDLE_MARKET_ADDRESSES = {
    aUSDC: {
        lp: '0x3f5ea53d1160177445b1898afbb16da111182418',
        pt: '0x930441aa7ab17654df5663781ca0c02cc17e6643',
        yt: '0x18d2d54f42ba720851bae861b98a0f4b079e6027',
        sy: '0xc4a9d8b486f388cc0e4168d2904277e8c8372fa3',
    },
    scUSD: {
        lp: '0x84ecc6be573f15991736131f924f7bf571ed3b60',
        pt: '0x9731842ed581816913933c01de142c7ee412a8c8',
        yt: '0x3ab07241db5e87e45edca012ddf4bde84c078920',
        sy: '0x068def65b9dbaff02b4ee54572a9fa7dfb188ea3',
    },
    'Lp - wstkscUSD': {
        lp: '0x004f76045b42ef3e89814b12b37e69da19c8a212',
        pt: '0x0fb682c9692addcc1769f4d4d938c54420d54fa3',
        yt: '0x2405243576fdff777d54963bca4782180287b6a1',
        sy: '0x896f4d49916ac5cfc36d7a260a7039ba4ea317b6',
    },
};
const BEETS_POOL = {
    deposit: '0x54Ca9aad90324C022bBeD0A94b7380c03aA5884A',
    stake: '0x724a6716bf9CA384584bEb51a2eA07564c7fdD69',
};
const PENPIE_MARKET_ADDRESS = '0x3f5ea53d1160177445b1898afbb16da111182418';
const PENPIE_CONTRACT = '0x7A89614B596720D4D0f51A69D6C1d55dB97E9aAB';
const YIELDFI_POOL = {
    'yUSD': "0x4772D2e014F9fC3a820C444e3313968e9a5C8121"
}

async function beetsTvl(api, owners) {
    const calls = owners.flatMap(owner => [
        { target: BEETS_POOL.deposit, params: [owner] },
        { target: BEETS_POOL.stake, params: [owner] },
    ]);
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls });

    // Process balances in pairs (deposit + stake) for each owner
    for (let i = 0; i < balances.length; i += 2) {
        const depositBalance = Number(balances[i]);
        const stakeBalance = Number(balances[i + 1]);
        const totalBalance = depositBalance + stakeBalance;

        // Add the combined balance for both deposit and stake tokens
        api.add(calls[i].target, totalBalance);
        api.add(calls[i + 1].target, totalBalance);
    }
}

async function penpieTvl(api, owners) {
    const balanceCalls = owners.map(owner => ({
        target: PENPIE_CONTRACT,
        params: [PENPIE_MARKET_ADDRESS, owner]
    }));
    const balances = await api.multiCall({
        abi: 'function balance(address,address) view returns (uint256)',
        calls: balanceCalls,
    });

    balances.forEach(balance => {
        api.add(PENPIE_MARKET_ADDRESS, balance);
    });
}

const sonicTokens = [
    YIELDFI_POOL.yUSD,
    ...Object.values(PENDLE_MARKET_ADDRESSES).flatMap(market =>
        Object.values(market)),
    ...Object.values(EULER_POOL_ADDRESSES),
    AAVE_TOKEN_ADDRESS,
    ...Object.values(SILO_POOL_ADDRESSES),

]

module.exports = {
    beetsTvl,
    penpieTvl,
    sonicTokens,
};