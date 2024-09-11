const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js'); 

async function tvl(api) {

    const storedTokenAddresses = [
        '0x0000000000000000000000000000000000000000', 
        '0x4237e0A5b55233D5B6D6d1D9BF421723954130D8', 
        '0xDeF886C55a79830C47108eeb9c37e78a49684e41'
    ];

    const stFTNAddress = "0x780Fb5AcA83F2e3F57EE18cc3094988Ef49D8c3d";
    const mUSDC = "0x4b7708Ee3Ccbd3F9af68208E69AD31f611e1bEfE";
    const mUSDT = "0xB7DC5EcA6DE5Cb9B46Ac405d3d4596333714f3f7";
    
    let pooledStFTN = new BigNumber(0);
    let pooledUSDC = new BigNumber(0);
    let pooledUSDT = new BigNumber(0);

        const lotteries = await api.call({ target: '0xE8aa1245E18185698f2af53D3ab4aC0f822120F8', abi: "address[]:getLotteries" });

        for (let lotteryAddress of lotteries) {

            const poolInfo = await api.call({
                target: "0xE8aa1245E18185698f2af53D3ab4aC0f822120F8",
                abi: {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "name": "poolInfo",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "token",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "lendToken",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "roundStart",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "roundEnd",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "version",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "yieldSource",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                params: [lotteryAddress],
            });

            if (poolInfo.token === storedTokenAddresses[0]) {
                const balance = await api.call({ target: stFTNAddress, abi: "erc20:balanceOf", params: lotteryAddress });
                pooledStFTN = pooledStFTN.plus(new BigNumber(balance));
            }
            if (poolInfo.token === storedTokenAddresses[1]) {
                const balance = await api.call({ target: mUSDC, abi: "erc20:balanceOf", params: lotteryAddress });
                pooledUSDC = pooledUSDC.plus(new BigNumber(balance));
            }
            if (poolInfo.token === storedTokenAddresses[2]) {
                const balance = await api.call({ target: mUSDT, abi: "erc20:balanceOf", params: lotteryAddress });
                pooledUSDT = pooledUSDT.plus(new BigNumber(balance));
            }
        }

        return {
            'coingecko:lolik-staked-ftn': pooledStFTN.toString() / (1e18),  // Assuming FTN has 18 decimals
            'coingecko:usd-coin': pooledUSDC.toString() / (1e6),    // Assuming USDC has 6 decimals
            'coingecko:tether': pooledUSDT.toString() / (1e6)     // Assuming USDT has 6 decimals
        };
}

module.exports = {
    methodology: 'Staked tokens are counted as TVL',
    ftn: { tvl },
};
