module.exports = {
  "CompoundSubscriptions": {
    "abi": {
      getSubscribers: "function getSubscribers() view returns (tuple(address user, uint128 minRatio, uint128 maxRatio, uint128 optimalRatioBoost, uint128 optimalRatioRepay, bool boostEnabled)[])",
    },
    "networks": {
      "1": {
        "createdBlock": 8335635,
          "address": "0x52015effd577e08f498a0ccc11905925d58d6207"
      }
    }
  },
  "CompoundLoanInfo": {
    "abi": {
      getLoanDataArr: "function getLoanDataArr(address[] _users) view returns (tuple(address user, uint128 ratio, address[] collAddr, address[] borrowAddr, uint256[] collAmounts, uint256[] borrowAmounts)[] loans)",
    },
    "networks": {
      "1": {
        "createdBlock": 8335635,
        "address": "0xb1f40b5109bba75c27a302c4e5d2afc30d5d1f30"
      }
    }
  },
  "McdSubscriptions": {
    "abi":{
      getSubscribers: "function getSubscribers() view returns (tuple(uint128 minRatio, uint128 maxRatio, uint128 optimalRatioBoost, uint128 optimalRatioRepay, address owner, uint256 cdpId, bool boostEnabled, bool nextPriceEnabled)[])",
    },
      "networks": {
      "1": {
        "createdBlock": 8335635,
          "address": "0xC45d4f6B6bf41b6EdAA58B01c4298B8d9078269a"
      }
    }
  },
  "MCDSaverProxy": {
    "abi": {
      getCdpDetailedInfo: "function getCdpDetailedInfo(uint256 _cdpId) view returns (uint256 collateral, uint256 debt, uint256 price, bytes32 ilk)",
    },
    "networks": {
      "42": {
        "createdBlock": 14500373,
        "address": "0xDbfdfDBcA9f796Bf955B8B4EB2b46dBb51CaE30B"
      },
      "1": {
        "createdBlock": 8928152,
        "address": "0x260C1543743FD03cD98a1d1eDC3A4724af0A1Fce"
      }
    }
  },
  "AaveSubscriptionsV2": {
    "abi": {
      getSubscribers: "function getSubscribers() view returns (tuple(address user, uint128 minRatio, uint128 maxRatio, uint128 optimalRatioBoost, uint128 optimalRatioRepay, bool boostEnabled)[])",
    },
    "networks": {
      "1": {
        "address": "0x6B25043BF08182d8e86056C6548847aF607cd7CD"
      }
    }
  },
  "AaveLoanInfoV2": {
    "abi": {
      getLoanDataArr: "function getLoanDataArr(address _market, address[] _users) view returns (tuple(address user, uint128 ratio, address[] collAddr, address[] borrowAddr, uint256[] collAmounts, uint256[] borrowStableAmounts, uint256[] borrowVariableAmounts)[] loans)",
    },
    "networks": {
      "1": {
        "address": "0xd0C9ADDABbA270493A6503e74E62794435c8F1D3"
      }
    }
  },
}
