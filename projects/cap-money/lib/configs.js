
const capConfig = {
    ethereum: {
        fromBlock: 22867447,
        fromTime: 1751892887,
        infra: {
            oracle: {
                address: '0xcD7f45566bc0E7303fB92A93969BB4D3f6e662bb',
                fromBlock: 22867447,
            },
            lender: {
                address: '0x15622c3dbbc5614E6DFa9446603c1779647f01FC',
                fromBlock: 22867447,
            },
            delegation: {
                address: '0xF3E3Eae671000612CE3Fd15e1019154C1a4d693F',
                fromBlock: 22867447,
            },
        },
        tokens: {
            cUSD: {
                id: 'cUSD',
                coingeckoId: 'cap-money-c-usd',
                decimals: 18,
                address: '0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC',
                fromBlock: 22874015,
            },
            stcUSD: {
                id: 'stcUSD',
                coingeckoId: 'cap-money-st-c-usd',
                decimals: 18,
                address: '0x88887bE419578051FF9F4eb6C858A951921D8888',
                fromBlock: 22874056,
            },
            WTGXX: {
                id: 'WTGXX',
                coingeckoId: 'wisdomtree-treasury-money-market-digital-fund',
                decimals: 18,
                address: '0x1feCF3d9d4Fee7f2c02917A66028a48C6706c179',
                creationBlock: 20750716n,
            },
            wWTGXX: {
                id: 'wWTGXX',
                coingeckoId: null,
                decimals: 18,
                address: '0x434558CB1EBe9950e8A66f1ef8A15A473Dce7D8c',
                creationBlock: 23635674n,
            },
        },
        coverageNetworkConfigs: {
            '0x8c9140fe6650e56a0a07e86455d745f8f7843b6d': {
                type: "symbiotic",
                network: '0x44f7e678e8412dbef1fd930f60af2bd125095962',
                networkMiddleware: '0x8c9140fe6650e56a0a07e86455d745f8f7843b6d',
            },
            '0x09a3976d8d63728d20dcdfee1e531c206ba91225': {
                type: "symbiotic",
                network: '0x98e52ea7578f2088c152e81b17a9a459bf089f2a',
                networkMiddleware: '0x09a3976d8d63728d20dcdfee1e531c206ba91225',
            },
            '0xe65c3eccd18879e103dbc96d854e376ced4cc7dd': {
                type: "eigenlayer",
                serviceManager: '0xe65c3eccd18879e103dbc96d854e376ced4cc7dd',
                allocationManager: '0x948a420b8CC1d6BFd0B6087C2E7c344a2CD0bc39',
                avs: '0xe65c3eccd18879e103dbc96d854e376ced4cc7dd',
                operatorSet: 1,
            },
        },
    },
};

const capABI = {
    Vault: {
        AddAssetEvent: 'event AddAsset(address asset)',
        totalSupplies: 'function totalSupplies(address _token) external view returns (uint256 totalSupply)',
        availableBalance: 'function availableBalance(address _asset) external view returns (uint256 amount)',
    },
    Lender: {
        ReserveAssetAddedEvent: 'event ReserveAssetAdded(address indexed asset, address vault, address debtToken, address interestReceiver, uint256 id)',
        debt: 'function debt(address _agent, address _asset) external view returns (uint256 totalDebt)',
    },
    Delegation: {
        AddAgentEvent: 'event AddAgent(address agent, address network, uint256 ltv, uint256 liquidationThreshold)',
    },
    SymbioticNetworkMiddleware: {
        coverageByVault: 'function coverageByVault(address _network, address _agent, address _vault, address _oracle, uint48 _timestamp) public view returns (uint256 collateralValue, uint256 collateral)',
        vaults: 'function vaults(address _agent) external view returns (address vaultAddress)',
    },
    EigenlayerServiceManager: {
        operatorToStrategy: 'function operatorToStrategy(address operator) external view returns (address)',
        coverage: 'function coverage(address _operator) external view returns (uint256 delegation)',
        getEigenOperator: 'function getEigenOperator(address _operator) external view returns (address)',
    },
}

const symbioticABI = {
    Vault: {
        collateral: 'function collateral() public view returns (address)',
    }
}

const eigenlayerABI = {
    IStrategy: {
        underlyingToken: 'function underlyingToken() external view returns (address)',
    },
    AllocationManager: {
        getAllocatedStake: {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "avs",
                            "type": "address"
                        },
                        {
                            "internalType": "uint32",
                            "name": "id",
                            "type": "uint32"
                        }
                    ],
                    "internalType": "struct OperatorSet",
                    "name": "operatorSet",
                    "type": "tuple"
                },
                {
                    "internalType": "address[]",
                    "name": "operators",
                    "type": "address[]"
                },
                {
                    "internalType": "contract IStrategy[]",
                    "name": "strategies",
                    "type": "address[]"
                }
            ],
            "name": "getAllocatedStake",
            "outputs": [
                {
                    "internalType": "uint256[][]",
                    "name": "",
                    "type": "uint256[][]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    }
}

module.exports = {
    capConfig,
    capABI,
    symbioticABI,
    eigenlayerABI,
}
