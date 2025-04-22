const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  polygon: { factory: '0x021297e233550eDBa8e6487EB7c6696cFBB63b88', fromBlock: 17072457 },
  bsc: { factory: '0x021297e233550eDBa8e6487EB7c6696cFBB63b88', fromBlock: 3369565 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({ api, target: factory, eventAbi: abi.OptionCreated, onlyArgs: true, fromBlock, })
      const ownerTokens = []
      logs.forEach(log => {
        const { _collateral, _underlying, long, short } = log
        ownerTokens.push([[_collateral, _underlying], long])
        ownerTokens.push([[_collateral, _underlying], short])
      })
      return sumTokens2({ api, ownerTokens, permitFailure: true, })
    }
  }
})

const abi = {
  "Burn": "event Burn(address indexed seller, address _creator, address indexed _collateral, address indexed _underlying, uint256 _strikePrice, uint256 _expiry, uint256 vol)",
  "Exercise": "event Exercise(address indexed buyer, address indexed _collateral, address indexed _underlying, uint256 _strikePrice, uint256 _expiry, uint256 volume, uint256 vol, uint256 fee, uint256 amt)",
  "GovernorshipTransferred": "event GovernorshipTransferred(address indexed previousGovernor, address indexed newGovernor)",
  "Mint": "event Mint(address indexed seller, bool _private, address indexed _collateral, address indexed _underlying, uint256 _strikePrice, uint256 _expiry, address long, address short, uint256 vol)",
  "OptionCreated": "event OptionCreated(address indexed creator, address indexed _collateral, address indexed _underlying, uint256 _strikePrice, uint256 _expiry, address long, address short, uint256 count)",
  "Settle": "event Settle(address indexed seller, address _creator, address indexed _collateral, address indexed _underlying, uint256 _strikePrice, uint256 _expiry, uint256 vol, uint256 col, uint256 fee, uint256 und)",
  "allLongs": "function allLongs(uint256) view returns (address)",
  "allShorts": "function allShorts(uint256) view returns (address)",
  "burn": "function burn(address longOrShort, uint256 volume) returns (address, address, uint256)",
  "calcExerciseAmount": "function calcExerciseAmount(address _long, uint256 volume) view returns (uint256)",
  "createOption": "function createOption(bool _private, address _collateral, address _underlying, uint256 _strikePrice, uint256 _expiry) returns (address long, address short)",
  "emitSettle": "function emitSettle(address seller, address _creator, address _collateral, address _underlying, uint256 _strikePrice, uint256 _expiry, uint256 vol, uint256 col, uint256 fee, uint256 und)",
  "exercise": "function exercise(address long, address[] path) returns (uint256 vol, uint256 fee, uint256 amt)",
  "exercise_": "function exercise_(address buyer, address _creator, address _collateral, address _underlying, uint256 _strikePrice, uint256 _expiry, uint256 volume, address[] path) returns (uint256 vol, uint256 fee, uint256 amt)",
  "getConfig": "function getConfig(bytes32 key, uint256 index) view returns (uint256)",
  "governor": "address:governor",
  "initialize": "function initialize(address governor_)",
  "length": "uint256:length",
  "longs": "function longs(address, address, address, uint256, uint256) view returns (address)",
  "mint": "function mint(bool _private, address _collateral, address _underlying, uint256 _strikePrice, uint256 _expiry, uint256 volume) returns (address long, address short, uint256 vol)",
  "mint_": "function mint_(address sender, bool _private, address _collateral, address _underlying, uint256 _strikePrice, uint256 _expiry, uint256 volume) returns (address long, address short, uint256 vol)",
  "pack_maturity_expiry": "function pack_maturity_expiry(uint256 maturity, uint256 expiry) pure returns (uint256)",
  "productImplementations": "function productImplementations(bytes32) view returns (address)",
  "renounceGovernorship": "function renounceGovernorship()",
  "setConfig": "function setConfig(bytes32 key, uint256 index, uint256 value)",
  "settle": "function settle(address _creator, address _collateral, address _underlying, uint256 _strikePrice, uint256 _expiry, uint256 volume) returns (uint256 vol, uint256 col, uint256 fee, uint256 und)",
  "settle_": "function settle_(address sender, address short, uint256 volume) returns (uint256 vol, uint256 col, uint256 fee, uint256 und)",
  "settleable": "function settleable(address seller, address short) view returns (uint256 vol, uint256 col, uint256 fee, uint256 und)",
  "shorts": "function shorts(address, address, address, uint256, uint256) view returns (address)",
  "transferGovernorship": "function transferGovernorship(address newGovernor)",
  "unpack_expiry": "function unpack_expiry(uint256 maturity_expiry) pure returns (uint256)",
  "unpack_maturity": "function unpack_maturity(uint256 maturity_expiry) pure returns (uint256)",
  "upgradeProductImplementationsTo": "function upgradeProductImplementationsTo(address _implLongOption, address _implShortOption)"
}