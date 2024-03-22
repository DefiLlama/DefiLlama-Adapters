
const ADDRESS_PROVIDER_ADDRESS = '0x110A3B051397956D69733B6fe947648bB9062cf1';
const ADDRESS_PROVIDER_ABI = "function registry() external view returns(address)";

const ARBITRUM_USDC_ADDRESS = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";

const REGISTRY_ABI = "function getDVPs() external view returns (address[] memory)";

const DVP_ABI = "function vault() external view returns (address)"

const VAULT_ABI = "function notional() public view returns (uint256)";

const VAULT_STATE_ABI = {
    "type": "function",
    "name": "state",
    "inputs": [],
    "outputs": [
        {
            "name": "liquidity",
            "type": "tuple",
            "internalType": "struct VaultLib.VaultLiquidity",
            "components": [
                {
                    "name": "lockedInitially",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pendingDeposits",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pendingWithdrawals",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "pendingPayoffs",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "newPendingPayoffs",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "totalDeposit",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ]
        },
        {
            "name": "withdrawals",
            "type": "tuple",
            "internalType": "struct VaultLib.VaultWithdrawals",
            "components": [
                {
                    "name": "heldShares",
                    "type": "uint256",
                    "internalType": "uint256"
                },
                {
                    "name": "newHeldShares",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ]
        },
        {
            "name": "dead",
            "type": "bool",
            "internalType": "bool"
        },
        {
            "name": "killed",
            "type": "bool",
            "internalType": "bool"
        }
    ],
    "stateMutability": "view"
};


exports.ADDRESS_PROVIDER_ABI = ADDRESS_PROVIDER_ABI
exports.ADDRESS_PROVIDER_ADDRESS = ADDRESS_PROVIDER_ADDRESS
exports.ARBITRUM_USDC_ADDRESS = ARBITRUM_USDC_ADDRESS;
exports.REGISTRY_ABI = REGISTRY_ABI;
exports.DVP_ABI = DVP_ABI;
exports.VAULT_ABI = VAULT_ABI;
exports.VAULT_STATE_ABI = VAULT_STATE_ABI;