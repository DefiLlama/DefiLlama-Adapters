let abis = {};

abis.cover = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newClaimNonce",
				"type": "uint256"
			}
		],
		"name": "ClaimAccepted",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "active",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "activeCovers",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "activeCoversLength",
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
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_collateral",
				"type": "address"
			},
			{
				"internalType": "uint48",
				"name": "_timestamp",
				"type": "uint48"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "addCover",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_claimNonce",
				"type": "uint256"
			}
		],
		"name": "claimDetails",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "_payoutNumerator",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_payoutDenominator",
				"type": "uint16"
			},
			{
				"internalType": "uint48",
				"name": "_incidentTimestamp",
				"type": "uint48"
			},
			{
				"internalType": "uint48",
				"name": "_timestamp",
				"type": "uint48"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimNonce",
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
	{
		"inputs": [],
		"name": "claimRedeemDelay",
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
	{
		"inputs": [],
		"name": "claimsLength",
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
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_collateral",
				"type": "address"
			}
		],
		"name": "collateralStatusMap",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "collaterals",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "collateralsLength",
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
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_collateral",
				"type": "address"
			},
			{
				"internalType": "uint48",
				"name": "_expirationTimestamp",
				"type": "uint48"
			}
		],
		"name": "coverMap",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_payoutNumerator",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_payoutDenominator",
				"type": "uint16"
			},
			{
				"internalType": "uint48",
				"name": "_incidentTimestamp",
				"type": "uint48"
			},
			{
				"internalType": "uint256",
				"name": "_protocolNonce",
				"type": "uint256"
			}
		],
		"name": "enactClaim",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint48",
				"name": "_expirationTimestamp",
				"type": "uint48"
			}
		],
		"name": "expirationTimestampMap",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "_name",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			}
		],
		"name": "expirationTimestamps",
		"outputs": [
			{
				"internalType": "uint48",
				"name": "",
				"type": "uint48"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "expirationTimestampsLength",
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
	{
		"inputs": [],
		"name": "getProtocolDetails",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "_name",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "_active",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "_claimNonce",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_claimRedeemDelay",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_noclaimRedeemDelay",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "_collaterals",
				"type": "address[]"
			},
			{
				"internalType": "uint48[]",
				"name": "_expirationTimestamps",
				"type": "uint48[]"
			},
			{
				"internalType": "address[]",
				"name": "_allCovers",
				"type": "address[]"
			},
			{
				"internalType": "address[]",
				"name": "_allActiveCovers",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "noclaimRedeemDelay",
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
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "_active",
				"type": "bool"
			}
		],
		"name": "setActive",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_claimRedeemDelay",
				"type": "uint256"
			}
		],
		"name": "updateClaimRedeemDelay",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_collateral",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			}
		],
		"name": "updateCollateral",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint48",
				"name": "_expirationTimestamp",
				"type": "uint48"
			},
			{
				"internalType": "bytes32",
				"name": "_expirationTimestampName",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "_status",
				"type": "uint8"
			}
		],
		"name": "updateExpirationTimestamp",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_noclaimRedeemDelay",
				"type": "uint256"
			}
		],
		"name": "updateNoclaimRedeemDelay",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]


abis.protocols = [{"inputs":[{"internalType":"address","name":"_protocolImplementation","type":"address"},{"internalType":"address","name":"_coverImplementation","type":"address"},{"internalType":"address","name":"_coverERC20Implementation","type":"address"},{"internalType":"address","name":"_governance","type":"address"},{"internalType":"address","name":"_treasury","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"protocolAddress","type":"address"}],"name":"ProtocolInitiation","type":"event"},{"inputs":[{"internalType":"bytes32","name":"_name","type":"bytes32"},{"internalType":"bool","name":"_active","type":"bool"},{"internalType":"address","name":"_collateral","type":"address"},{"internalType":"uint48[]","name":"_timestamps","type":"uint48[]"},{"internalType":"bytes32[]","name":"_timestampNames","type":"bytes32[]"}],"name":"addProtocol","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"coverERC20Implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"coverImplementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllProtocolAddresses","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_protocolName","type":"bytes32"},{"internalType":"uint48","name":"_timestamp","type":"uint48"},{"internalType":"address","name":"_collateral","type":"address"},{"internalType":"uint256","name":"_claimNonce","type":"uint256"},{"internalType":"bool","name":"_isClaimCovToken","type":"bool"}],"name":"getCovTokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_protocolName","type":"bytes32"},{"internalType":"uint48","name":"_timestamp","type":"uint48"},{"internalType":"address","name":"_collateral","type":"address"},{"internalType":"uint256","name":"_claimNonce","type":"uint256"}],"name":"getCoverAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_name","type":"bytes32"}],"name":"getProtocolAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getProtocolNameAndAddress","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getProtocolsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRedeemFees","outputs":[{"internalType":"uint16","name":"_numerator","type":"uint16"},{"internalType":"uint16","name":"_denominator","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"governance","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"protocolImplementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"protocols","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"redeemFeeDenominator","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"redeemFeeNumerator","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"updateClaimManager","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newImplementation","type":"address"}],"name":"updateCoverERC20Implementation","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newImplementation","type":"address"}],"name":"updateCoverImplementation","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_redeemFeeNumerator","type":"uint16"},{"internalType":"uint16","name":"_redeemFeeDenominator","type":"uint16"}],"name":"updateFees","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"updateGovernance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newImplementation","type":"address"}],"name":"updateProtocolImplementation","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"updateTreasury","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]

module.exports = {
  abis
}
