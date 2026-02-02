const tBTCVault = [
  {
    "type": "function",
    "name": "get_vesu_collateral",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_vesu_debt",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_current_cycle",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u64"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_cycle_total_collateral",
    "inputs": [
      {
        "name": "cycle_id",
        "type": "core::integer::u64"
      }
    ],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_participants_count",
    "inputs": [
      {
        "name": "cycle_id",
        "type": "core::integer::u64"
      }
    ],
    "outputs": [
      {
        "type": "core::integer::u64"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_cycle_yield",
    "inputs": [
      {
        "name": "cycle_id",
        "type": "core::integer::u64"
      }
    ],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_treasury_fee_bps",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_management_fee_bps",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  }
]

const tBTCVaultABIMap = {}
tBTCVault.forEach(i => tBTCVaultABIMap[i.name] = i)

module.exports = {
  tBTCVaultABIMap
}
