const SENSI_TOKEN_CONTRACT = '0x63e77cf206801782239d4f126cfa22b517fb4edb'
const SENSI_LOCKING_CONTRACT = '0xc13Aff57B67145012Ef3a4604bDB3f3dA17E114f'
const SENSI_SY_CONTRACT = '0x21B656d3818A1dD07B800c1FE728fB81921af3A3'

const SY_ABI = {
    getSYPortfolio: 
    {
		"inputs": [],
		"name": "getSYPortfolio",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "totalPayToken",
						"type": "uint256",
					},
					{
						"internalType": "uint256",
						"name": "totalBuyInToken",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "rewardsInPool",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "rewardsLastRun",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lockingLastRun",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "SENSICirculatingSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "SYNFTCirculatingSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastMintedSYNFTID",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalVaults",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalActiveVaults",
						"type": "uint256"
					}
				],
				"internalType": "struct SY_Total_Deposit",
				"name": "SY_Portfolio",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
}


async function tvl(api){
    await locking_TVL(api)
    await SY_TVL(api)
}

async function locking_TVL(api) {
    const balance_of_sensi_locks = await api.call({
        abi: 'erc20:balanceOf',
        target: SENSI_TOKEN_CONTRACT,
        params: [SENSI_LOCKING_CONTRACT]
    }) 

    api.add(SENSI_TOKEN_CONTRACT, balance_of_sensi_locks)
}

async function SY_TVL(api) {
    const balance_of_SY = await api.call({abi: SY_ABI.getSYPortfolio,
        target: SENSI_SY_CONTRACT})

    const balance_of_SY_TVL = balance_of_SY.totalPayToken
    api.add("0x0000000000000000000000000000000000000000", balance_of_SY_TVL)
}

module.exports = {
    methodology: 'Counts how many tokens are in Sensi Locks and in SmartYield',
    bsc: {
        tvl,
        vesting: locking_TVL,
    }
}