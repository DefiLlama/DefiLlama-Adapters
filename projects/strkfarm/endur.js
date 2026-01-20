const Endur = [
    {
        "name": "preview_redeem",
        "type": "function",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
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
        "name": "convert_to_assets",
        "type": "function",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
  ]
  
  const endurABIMap = {}
  Endur.forEach(i => endurABIMap[i.name] = i)
  
  module.exports = {
    endurABIMap
  }