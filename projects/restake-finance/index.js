const StakePools = [
    { // stETH
        controller: '0xe384251B5f445A006519A2197bc6bD8E5fA228E5',
        token: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    },
    { // mETH
        controller: '0x0448FddC3f4D666eC81DAc8172E60b8e5852386c',
        token: '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
    },
    { // osETH
        controller: '0x357DEeD02020b73F8A124c4ea2bE3B6A725aaeC2',
        token: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
    },
    { // sfrxETH
        controller: '0xD7BC2FE1d0167BD2532587e991abE556E3a66f3b',
        token: '0xac3e018457b222d93114458476f3e3416abbe38f',
    },
    { // ankrETH
        controller: '0xD5193B851bf7C751BBA862Eca1298D4B4Cb17B81',
        token: '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb',
    },
];

async function tvl(_1, _2, _3, { api }) {
    await Promise.all(
        StakePools.map(pool =>
            api.call({
                target: pool.controller,
                abi: 'uint256:getTotalUnderlying',
            })
            .then((value) => api.add(pool.token, value)),
        ),
    );
}
  
module.exports = {
    ethereum: {
        tvl,
    }
};
