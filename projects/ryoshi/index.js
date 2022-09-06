const { masterchefExports } = require('../helper/unknownTokens')
const wDoge = '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101'
const nullAddress = '0x0000000000000000000000000000000000000000'


module.exports = masterchefExports({
  chain: 'dogechain',
  masterchef: '0x206949295503c4FC5C9757099db479dD5383A5dC',
  nativeTokens: ['0xa4F9877A08F7639df15D506eAFF92Ab5E78273cd', '0xa98fa09D0BED62A9e0Fb2E58635b7C9274160dc7', ],
  useDefaultCoreAssets: true,
  poolLengthAbi: {
		"inputs": [],
		"name": "poolCounter",
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
  poolInfoABI: {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pools",
		"outputs": [
			{
				"internalType": "address",
				"name": "stakingToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "rewardsToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "finishAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "updatedAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rewardRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rewardPerTokenStored",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalSupply",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
  getToken: i => i.stakingToken === nullAddress ? wDoge : i.stakingToken,
})