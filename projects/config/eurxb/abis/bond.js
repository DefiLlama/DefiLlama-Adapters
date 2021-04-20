let bond = [{
	inputs: [{ internalType: 'string', name: 'baseURI', type: 'string' }],
	stateMutability: 'nonpayable',
	type: 'constructor',
}, {
	anonymous: false,
	inputs: [{
		indexed: true, internalType: 'address', name: 'owner', type: 'address',
	}, {
		indexed: true,
		internalType: 'address',
		name: 'approved',
		type: 'address',
	}, {
		indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256',
	}],
	name: 'Approval',
	type: 'event',
}, {
	anonymous: false,
	inputs: [{
		indexed: true, internalType: 'address', name: 'owner', type: 'address',
	}, {
		indexed: true,
		internalType: 'address',
		name: 'operator',
		type: 'address',
	}, {
		indexed: false, internalType: 'bool', name: 'approved', type: 'bool',
	}],
	name: 'ApprovalForAll',
	type: 'event',
}, {
	anonymous: false,
	inputs: [{
		indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32',
	}, {
		indexed: true,
		internalType: 'bytes32',
		name: 'previousAdminRole',
		type: 'bytes32',
	}, {
		indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32',
	}],
	name: 'RoleAdminChanged',
	type: 'event',
}, {
	anonymous: false,
	inputs: [{
		indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32',
	}, {
		indexed: true,
		internalType: 'address',
		name: 'account',
		type: 'address',
	}, {
		indexed: true, internalType: 'address', name: 'sender', type: 'address',
	}],
	name: 'RoleGranted',
	type: 'event',
}, {
	anonymous: false,
	inputs: [{
		indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32',
	}, {
		indexed: true,
		internalType: 'address',
		name: 'account',
		type: 'address',
	}, {
		indexed: true, internalType: 'address', name: 'sender', type: 'address',
	}],
	name: 'RoleRevoked',
	type: 'event',
}, {
	anonymous: false,
	inputs: [{
		indexed: true, internalType: 'address', name: 'from', type: 'address',
	}, {
		indexed: true,
		internalType: 'address',
		name: 'to',
		type: 'address',
	}, {
		indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256',
	}],
	name: 'Transfer',
	type: 'event',
}, {
	inputs: [],
	name: 'DEFAULT_ADMIN_ROLE',
	outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: '', type: 'address' }, {
		internalType: 'uint256',
		name: '',
		type: 'uint256',
	}],
	name: 'approve',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
	name: 'balanceOf',
	outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [],
	name: 'baseURI',
	outputs: [{ internalType: 'string', name: '', type: 'string' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'burn',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: 'allowList', type: 'address' }, {
		internalType: 'address',
		name: 'sat',
		type: 'address',
	}, { internalType: 'address', name: 'ddp', type: 'address' }],
	name: 'configure',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	name: 'getApproved',
	outputs: [{ internalType: 'address', name: '', type: 'address' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
	name: 'getRoleAdmin',
	outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, {
		internalType: 'uint256',
		name: 'index',
		type: 'uint256',
	}],
	name: 'getRoleMember',
	outputs: [{ internalType: 'address', name: '', type: 'address' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
	name: 'getRoleMemberCount',
	outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'getTokenInfo',
	outputs: [{ internalType: 'uint256', name: 'value', type: 'uint256' }, {
		internalType: 'uint256',
		name: 'interest',
		type: 'uint256',
	}, { internalType: 'uint256', name: 'maturity', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, {
		internalType: 'address',
		name: 'account',
		type: 'address',
	}],
	name: 'grantRole',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, {
		internalType: 'address',
		name: 'account',
		type: 'address',
	}],
	name: 'hasRole',
	outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'hasToken',
	outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: '', type: 'address' }, {
		internalType: 'address',
		name: '',
		type: 'address',
	}],
	name: 'isApprovedForAll',
	outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }, {
		internalType: 'address',
		name: 'to',
		type: 'address',
	}, { internalType: 'uint256', name: 'value', type: 'uint256' }, {
		internalType: 'uint256',
		name: 'maturity',
		type: 'uint256',
	}],
	name: 'mint',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [],
	name: 'name',
	outputs: [{ internalType: 'string', name: '', type: 'string' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'ownerOf',
	outputs: [{ internalType: 'address', name: '', type: 'address' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, {
		internalType: 'address',
		name: 'account',
		type: 'address',
	}],
	name: 'renounceRole',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, {
		internalType: 'address',
		name: 'account',
		type: 'address',
	}],
	name: 'revokeRole',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: 'from', type: 'address' }, {
		internalType: 'address',
		name: 'to',
		type: 'address',
	}, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'safeTransferFrom',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: 'from', type: 'address' }, {
		internalType: 'address',
		name: 'to',
		type: 'address',
	}, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }, {
		internalType: 'bytes',
		name: '_data',
		type: 'bytes',
	}],
	name: 'safeTransferFrom',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: '', type: 'address' }, {
		internalType: 'bool',
		name: '',
		type: 'bool',
	}],
	name: 'setApprovalForAll',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}, {
	inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
	name: 'supportsInterface',
	outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [],
	name: 'symbol',
	outputs: [{ internalType: 'string', name: '', type: 'string' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
	name: 'tokenByIndex',
	outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, {
		internalType: 'uint256',
		name: 'index',
		type: 'uint256',
	}],
	name: 'tokenOfOwnerByIndex',
	outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'tokenURI',
	outputs: [{ internalType: 'string', name: '', type: 'string' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [],
	name: 'totalSupply',
	outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [],
	name: 'totalValue',
	outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
	stateMutability: 'view',
	type: 'function',
}, {
	inputs: [{ internalType: 'address', name: 'from', type: 'address' }, {
		internalType: 'address',
		name: 'to',
		type: 'address',
	}, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
	name: 'transferFrom',
	outputs: [],
	stateMutability: 'nonpayable',
	type: 'function',
}];

module.exports = { bond };