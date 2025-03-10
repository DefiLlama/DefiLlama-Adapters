module.exports = {
  usdnProtocolAbi: [
    {
      type: "function",
      name: "acceptDefaultAdminTransfer",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "beginDefaultAdminTransfer",
      inputs: [
        {
          name: "newAdmin",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "burnSdex",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "cancelDefaultAdminTransfer",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "changeDefaultAdminDelay",
      inputs: [
        {
          name: "newDelay",
          type: "uint48",
          internalType: "uint48",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "defaultAdmin",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "defaultAdminDelay",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint48",
          internalType: "uint48",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "defaultAdminDelayIncreaseWait",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint48",
          internalType: "uint48",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "domainSeparatorV4",
      inputs: [],
      outputs: [
        {
          name: "domainSeparatorV4_",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "eip712Domain",
      inputs: [],
      outputs: [
        {
          name: "fields",
          type: "bytes1",
          internalType: "bytes1",
        },
        {
          name: "name",
          type: "string",
          internalType: "string",
        },
        {
          name: "version",
          type: "string",
          internalType: "string",
        },
        {
          name: "chainId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
          internalType: "address",
        },
        {
          name: "salt",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "extensions",
          type: "uint256[]",
          internalType: "uint256[]",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "funding",
      inputs: [
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "funding_",
          type: "int256",
          internalType: "int256",
        },
        {
          name: "fundingPerDay_",
          type: "int256",
          internalType: "int256",
        },
        {
          name: "oldLongExpo_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getActionablePendingActions",
      inputs: [
        {
          name: "currentUser",
          type: "address",
          internalType: "address",
        },
        {
          name: "lookAhead",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "maxIter",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "actions_",
          type: "tuple[]",
          internalType: "struct IUsdnProtocolTypes.PendingAction[]",
          components: [
            {
              name: "action",
              type: "uint8",
              internalType: "enum IUsdnProtocolTypes.ProtocolAction",
            },
            {
              name: "timestamp",
              type: "uint40",
              internalType: "uint40",
            },
            {
              name: "var0",
              type: "uint24",
              internalType: "uint24",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "validator",
              type: "address",
              internalType: "address",
            },
            {
              name: "securityDepositValue",
              type: "uint64",
              internalType: "uint64",
            },
            {
              name: "var1",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "var2",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "var3",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "var4",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "var5",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "var6",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "var7",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "rawIndices_",
          type: "uint128[]",
          internalType: "uint128[]",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getAsset",
      inputs: [],
      outputs: [
        {
          name: "asset_",
          type: "address",
          internalType: "contract IERC20Metadata",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getAssetDecimals",
      inputs: [],
      outputs: [
        {
          name: "decimals_",
          type: "uint8",
          internalType: "uint8",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getBalanceLong",
      inputs: [],
      outputs: [
        {
          name: "balanceLong_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getBalanceVault",
      inputs: [],
      outputs: [
        {
          name: "balanceVault_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getCloseExpoImbalanceLimitBps",
      inputs: [],
      outputs: [
        {
          name: "closeExpoImbalanceLimitBps_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getCurrentLongPosition",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
        {
          name: "index",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "position_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.Position",
          components: [
            {
              name: "validated",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "timestamp",
              type: "uint40",
              internalType: "uint40",
            },
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "totalExpo",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "amount",
              type: "uint128",
              internalType: "uint128",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getDepositExpoImbalanceLimitBps",
      inputs: [],
      outputs: [
        {
          name: "depositExpoImbalanceLimitBps_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEMA",
      inputs: [],
      outputs: [
        {
          name: "ema_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEMAPeriod",
      inputs: [],
      outputs: [
        {
          name: "period_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEffectivePriceForTick",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
        {
          name: "assetPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "longTradingExpo",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "accumulator",
          type: "tuple",
          internalType: "struct HugeUint.Uint512",
          components: [
            {
              name: "hi",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "lo",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "price_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEffectivePriceForTick",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
      ],
      outputs: [
        {
          name: "price_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEffectiveTickForPrice",
      inputs: [
        {
          name: "price",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "tick_",
          type: "int24",
          internalType: "int24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getEffectiveTickForPrice",
      inputs: [
        {
          name: "price",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "assetPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "longTradingExpo",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "accumulator",
          type: "tuple",
          internalType: "struct HugeUint.Uint512",
          components: [
            {
              name: "hi",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "lo",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "tickSpacing",
          type: "int24",
          internalType: "int24",
        },
      ],
      outputs: [
        {
          name: "tick_",
          type: "int24",
          internalType: "int24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getFallbackAddress",
      inputs: [],
      outputs: [
        {
          name: "fallback_",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getFeeCollector",
      inputs: [],
      outputs: [
        {
          name: "feeCollector_",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getFeeThreshold",
      inputs: [],
      outputs: [
        {
          name: "threshold_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getFundingSF",
      inputs: [],
      outputs: [
        {
          name: "scalingFactor_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getHighestPopulatedTick",
      inputs: [],
      outputs: [
        {
          name: "tick_",
          type: "int24",
          internalType: "int24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLastFundingPerDay",
      inputs: [],
      outputs: [
        {
          name: "lastFunding_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLastPrice",
      inputs: [],
      outputs: [
        {
          name: "lastPrice_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLastUpdateTimestamp",
      inputs: [],
      outputs: [
        {
          name: "lastTimestamp_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLiqMultiplierAccumulator",
      inputs: [],
      outputs: [
        {
          name: "accumulator_",
          type: "tuple",
          internalType: "struct HugeUint.Uint512",
          components: [
            {
              name: "hi",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "lo",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLiqPriceFromDesiredLiqPrice",
      inputs: [
        {
          name: "desiredLiqPriceWithoutPenalty",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "assetPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "longTradingExpo",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "accumulator",
          type: "tuple",
          internalType: "struct HugeUint.Uint512",
          components: [
            {
              name: "hi",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "lo",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "tickSpacing",
          type: "int24",
          internalType: "int24",
        },
        {
          name: "liquidationPenalty",
          type: "uint24",
          internalType: "uint24",
        },
      ],
      outputs: [
        {
          name: "liqPrice_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLiquidationIteration",
      inputs: [],
      outputs: [
        {
          name: "iterations_",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLiquidationPenalty",
      inputs: [],
      outputs: [
        {
          name: "liquidationPenalty_",
          type: "uint24",
          internalType: "uint24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLiquidationRewardsManager",
      inputs: [],
      outputs: [
        {
          name: "liquidationRewardsManager_",
          type: "address",
          internalType: "contract IBaseLiquidationRewardsManager",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLongImbalanceTargetBps",
      inputs: [],
      outputs: [
        {
          name: "targetLongImbalance_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLongPosition",
      inputs: [
        {
          name: "posId",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "pos_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.Position",
          components: [
            {
              name: "validated",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "timestamp",
              type: "uint40",
              internalType: "uint40",
            },
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "totalExpo",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "amount",
              type: "uint128",
              internalType: "uint128",
            },
          ],
        },
        {
          name: "liquidationPenalty_",
          type: "uint24",
          internalType: "uint24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLowLatencyValidatorDeadline",
      inputs: [],
      outputs: [
        {
          name: "deadline_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getMaxLeverage",
      inputs: [],
      outputs: [
        {
          name: "maxLeverage_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getMiddlewareValidationDelay",
      inputs: [],
      outputs: [
        {
          name: "delay_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getMinLeverage",
      inputs: [],
      outputs: [
        {
          name: "minLeverage_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getMinLongPosition",
      inputs: [],
      outputs: [
        {
          name: "minLongPosition_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getNonce",
      inputs: [
        {
          name: "user",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "nonce_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getOnChainValidatorDeadline",
      inputs: [],
      outputs: [
        {
          name: "deadline_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getOpenExpoImbalanceLimitBps",
      inputs: [],
      outputs: [
        {
          name: "openExpoImbalanceLimitBps_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getOracleMiddleware",
      inputs: [],
      outputs: [
        {
          name: "oracleMiddleware_",
          type: "address",
          internalType: "contract IBaseOracleMiddleware",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPendingBalanceVault",
      inputs: [],
      outputs: [
        {
          name: "pendingBalanceVault_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPendingProtocolFee",
      inputs: [],
      outputs: [
        {
          name: "protocolFees_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPositionFeeBps",
      inputs: [],
      outputs: [
        {
          name: "feeBps_",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPositionValue",
      inputs: [
        {
          name: "posId",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "price",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "value_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPriceFeedDecimals",
      inputs: [],
      outputs: [
        {
          name: "decimals_",
          type: "uint8",
          internalType: "uint8",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getProtocolFeeBps",
      inputs: [],
      outputs: [
        {
          name: "feeBps_",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getRebalancer",
      inputs: [],
      outputs: [
        {
          name: "rebalancer_",
          type: "address",
          internalType: "contract IBaseRebalancer",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getRebalancerBonusBps",
      inputs: [],
      outputs: [
        {
          name: "bonusBps_",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getRebalancerCloseExpoImbalanceLimitBps",
      inputs: [],
      outputs: [
        {
          name: "rebalancerCloseExpoImbalanceLimitBps_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getRoleAdmin",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSafetyMarginBps",
      inputs: [],
      outputs: [
        {
          name: "safetyMarginBps_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSdex",
      inputs: [],
      outputs: [
        {
          name: "sdex_",
          type: "address",
          internalType: "contract IERC20Metadata",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSdexBurnOnDepositRatio",
      inputs: [],
      outputs: [
        {
          name: "ratio_",
          type: "uint32",
          internalType: "uint32",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSdexRewardsRatioBps",
      inputs: [],
      outputs: [
        {
          name: "rewardsBps_",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSecurityDepositValue",
      inputs: [],
      outputs: [
        {
          name: "securityDeposit_",
          type: "uint64",
          internalType: "uint64",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTargetUsdnPrice",
      inputs: [],
      outputs: [
        {
          name: "price_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTickData",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
      ],
      outputs: [
        {
          name: "tickData_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.TickData",
          components: [
            {
              name: "totalExpo",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalPos",
              type: "uint248",
              internalType: "uint248",
            },
            {
              name: "liquidationPenalty",
              type: "uint24",
              internalType: "uint24",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTickLiquidationPenalty",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
      ],
      outputs: [
        {
          name: "liquidationPenalty_",
          type: "uint24",
          internalType: "uint24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTickSpacing",
      inputs: [],
      outputs: [
        {
          name: "tickSpacing_",
          type: "int24",
          internalType: "int24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTickVersion",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
      ],
      outputs: [
        {
          name: "tickVersion_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTotalExpo",
      inputs: [],
      outputs: [
        {
          name: "totalExpo_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTotalLongPositions",
      inputs: [],
      outputs: [
        {
          name: "totalLongPositions_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUsdn",
      inputs: [],
      outputs: [
        {
          name: "usdn_",
          type: "address",
          internalType: "contract IUsdn",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUsdnMinDivisor",
      inputs: [],
      outputs: [
        {
          name: "minDivisor_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUsdnRebaseThreshold",
      inputs: [],
      outputs: [
        {
          name: "threshold_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUserPendingAction",
      inputs: [
        {
          name: "user",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "action_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PendingAction",
          components: [
            {
              name: "action",
              type: "uint8",
              internalType: "enum IUsdnProtocolTypes.ProtocolAction",
            },
            {
              name: "timestamp",
              type: "uint40",
              internalType: "uint40",
            },
            {
              name: "var0",
              type: "uint24",
              internalType: "uint24",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "validator",
              type: "address",
              internalType: "address",
            },
            {
              name: "securityDepositValue",
              type: "uint64",
              internalType: "uint64",
            },
            {
              name: "var1",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "var2",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "var3",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "var4",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "var5",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "var6",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "var7",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getVaultFeeBps",
      inputs: [],
      outputs: [
        {
          name: "feeBps_",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getWithdrawalExpoImbalanceLimitBps",
      inputs: [],
      outputs: [
        {
          name: "withdrawalExpoImbalanceLimitBps_",
          type: "int256",
          internalType: "int256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "grantRole",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "hasRole",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "initialize",
      inputs: [
        {
          name: "depositAmount",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "longAmount",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "desiredLiqPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "initializeStorage",
      inputs: [
        {
          name: "usdn",
          type: "address",
          internalType: "contract IUsdn",
        },
        {
          name: "sdex",
          type: "address",
          internalType: "contract IERC20Metadata",
        },
        {
          name: "asset",
          type: "address",
          internalType: "contract IERC20Metadata",
        },
        {
          name: "oracleMiddleware",
          type: "address",
          internalType: "contract IBaseOracleMiddleware",
        },
        {
          name: "liquidationRewardsManager",
          type: "address",
          internalType: "contract IBaseLiquidationRewardsManager",
        },
        {
          name: "tickSpacing",
          type: "int24",
          internalType: "int24",
        },
        {
          name: "feeCollector",
          type: "address",
          internalType: "address",
        },
        {
          name: "protocolFallback",
          type: "address",
          internalType: "contract IUsdnProtocolFallback",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "initiateClosePosition",
      inputs: [
        {
          name: "posId",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "amountToClose",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "userMinPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "deadline",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
        {
          name: "delegationSignature",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [
        {
          name: "outcome_",
          type: "uint8",
          internalType: "enum IUsdnProtocolTypes.LongActionOutcome",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "initiateDeposit",
      inputs: [
        {
          name: "amount",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "sharesOutMin",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "deadline",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "success_",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "initiateOpenPosition",
      inputs: [
        {
          name: "amount",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "desiredLiqPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "userMaxPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "userMaxLeverage",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "deadline",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "isInitiated_",
          type: "bool",
          internalType: "bool",
        },
        {
          name: "posId_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "initiateWithdrawal",
      inputs: [
        {
          name: "usdnShares",
          type: "uint152",
          internalType: "uint152",
        },
        {
          name: "amountOutMin",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "deadline",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "success_",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "isPaused",
      inputs: [],
      outputs: [
        {
          name: "isPaused_",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "liquidate",
      inputs: [
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [
        {
          name: "liquidatedTicks_",
          type: "tuple[]",
          internalType: "struct IUsdnProtocolTypes.LiqTickInfo[]",
          components: [
            {
              name: "totalPositions",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalExpo",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "remainingCollateral",
              type: "int256",
              internalType: "int256",
            },
            {
              name: "tickPrice",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "priceWithoutPenalty",
              type: "uint128",
              internalType: "uint128",
            },
          ],
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "longAssetAvailableWithFunding",
      inputs: [
        {
          name: "currentPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "available_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "longTradingExpoWithFunding",
      inputs: [
        {
          name: "currentPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "expo_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "minTick",
      inputs: [],
      outputs: [
        {
          name: "tick_",
          type: "int24",
          internalType: "int24",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "pause",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "pauseSafe",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "pendingDefaultAdmin",
      inputs: [],
      outputs: [
        {
          name: "newAdmin",
          type: "address",
          internalType: "address",
        },
        {
          name: "acceptSchedule",
          type: "uint48",
          internalType: "uint48",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "pendingDefaultAdminDelay",
      inputs: [],
      outputs: [
        {
          name: "newDelay",
          type: "uint48",
          internalType: "uint48",
        },
        {
          name: "effectSchedule",
          type: "uint48",
          internalType: "uint48",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "previewDeposit",
      inputs: [
        {
          name: "amount",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "price",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "usdnSharesExpected_",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "sdexToBurn_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "previewWithdraw",
      inputs: [
        {
          name: "usdnShares",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "price",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "assetExpected_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "refundSecurityDeposit",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "removeBlockedPendingAction",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          internalType: "address payable",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "removeBlockedPendingAction",
      inputs: [
        {
          name: "rawIndex",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "to",
          type: "address",
          internalType: "address payable",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "removeBlockedPendingActionNoCleanup",
      inputs: [
        {
          name: "rawIndex",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "to",
          type: "address",
          internalType: "address payable",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "removeBlockedPendingActionNoCleanup",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          internalType: "address payable",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "renounceRole",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "callerConfirmation",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "revokeRole",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "rollbackDefaultAdminDelay",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setEMAPeriod",
      inputs: [
        {
          name: "newEMAPeriod",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setExpoImbalanceLimits",
      inputs: [
        {
          name: "newOpenLimitBps",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newDepositLimitBps",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newWithdrawalLimitBps",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newCloseLimitBps",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newRebalancerCloseLimitBps",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "newLongImbalanceTargetBps",
          type: "int256",
          internalType: "int256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setFeeCollector",
      inputs: [
        {
          name: "newFeeCollector",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setFeeThreshold",
      inputs: [
        {
          name: "newFeeThreshold",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setFundingSF",
      inputs: [
        {
          name: "newFundingSF",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setLiquidationIteration",
      inputs: [
        {
          name: "newLiquidationIteration",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setLiquidationPenalty",
      inputs: [
        {
          name: "newLiquidationPenalty",
          type: "uint24",
          internalType: "uint24",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setLiquidationRewardsManager",
      inputs: [
        {
          name: "newLiquidationRewardsManager",
          type: "address",
          internalType: "contract IBaseLiquidationRewardsManager",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setMaxLeverage",
      inputs: [
        {
          name: "newMaxLeverage",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setMinLeverage",
      inputs: [
        {
          name: "newMinLeverage",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setMinLongPosition",
      inputs: [
        {
          name: "newMinLongPosition",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setOracleMiddleware",
      inputs: [
        {
          name: "newOracleMiddleware",
          type: "address",
          internalType: "contract IBaseOracleMiddleware",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setPositionFeeBps",
      inputs: [
        {
          name: "newPositionFee",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setProtocolFeeBps",
      inputs: [
        {
          name: "newFeeBps",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setRebalancer",
      inputs: [
        {
          name: "newRebalancer",
          type: "address",
          internalType: "contract IBaseRebalancer",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setRebalancerBonusBps",
      inputs: [
        {
          name: "newBonus",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setSafetyMarginBps",
      inputs: [
        {
          name: "newSafetyMarginBps",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setSdexBurnOnDepositRatio",
      inputs: [
        {
          name: "newRatio",
          type: "uint32",
          internalType: "uint32",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setSdexRewardsRatioBps",
      inputs: [
        {
          name: "newRewardsBps",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setSecurityDepositValue",
      inputs: [
        {
          name: "securityDepositValue",
          type: "uint64",
          internalType: "uint64",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setTargetUsdnPrice",
      inputs: [
        {
          name: "newPrice",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setUsdnRebaseThreshold",
      inputs: [
        {
          name: "newThreshold",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setValidatorDeadlines",
      inputs: [
        {
          name: "newLowLatencyValidatorDeadline",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "newOnChainValidatorDeadline",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setVaultFeeBps",
      inputs: [
        {
          name: "newVaultFee",
          type: "uint16",
          internalType: "uint16",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "tickHash",
      inputs: [
        {
          name: "tick",
          type: "int24",
          internalType: "int24",
        },
        {
          name: "version",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "hash_",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
      stateMutability: "pure",
    },
    {
      type: "function",
      name: "transferPositionOwnership",
      inputs: [
        {
          name: "posId",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "newOwner",
          type: "address",
          internalType: "address",
        },
        {
          name: "delegationSignature",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "unpause",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "unpauseSafe",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "upgradeToAndCall",
      inputs: [
        {
          name: "newImplementation",
          type: "address",
          internalType: "address",
        },
        {
          name: "data",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "usdnPrice",
      inputs: [
        {
          name: "currentPrice",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "price_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "usdnPrice",
      inputs: [
        {
          name: "currentPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "price_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "validateActionablePendingActions",
      inputs: [
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
        {
          name: "maxValidations",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "validatedActions_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "validateClosePosition",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "closePriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "outcome_",
          type: "uint8",
          internalType: "enum IUsdnProtocolTypes.LongActionOutcome",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "validateDeposit",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "depositPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "success_",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "validateOpenPosition",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "openPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "outcome_",
          type: "uint8",
          internalType: "enum IUsdnProtocolTypes.LongActionOutcome",
        },
        {
          name: "posId_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "validateWithdrawal",
      inputs: [
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "withdrawalPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
      ],
      outputs: [
        {
          name: "success_",
          type: "bool",
          internalType: "bool",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "vaultAssetAvailableWithFunding",
      inputs: [
        {
          name: "currentPrice",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "timestamp",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "available_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "DefaultAdminDelayChangeCanceled",
      inputs: [],
      anonymous: false,
    },
    {
      type: "event",
      name: "DefaultAdminDelayChangeScheduled",
      inputs: [
        {
          name: "newDelay",
          type: "uint48",
          indexed: false,
          internalType: "uint48",
        },
        {
          name: "effectSchedule",
          type: "uint48",
          indexed: false,
          internalType: "uint48",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "DefaultAdminTransferCanceled",
      inputs: [],
      anonymous: false,
    },
    {
      type: "event",
      name: "DefaultAdminTransferScheduled",
      inputs: [
        {
          name: "newAdmin",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "acceptSchedule",
          type: "uint48",
          indexed: false,
          internalType: "uint48",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "EIP712DomainChanged",
      inputs: [],
      anonymous: false,
    },
    {
      type: "event",
      name: "RoleAdminChanged",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "previousAdminRole",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "newAdminRole",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "RoleGranted",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "sender",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "RoleRevoked",
      inputs: [
        {
          name: "role",
          type: "bytes32",
          indexed: true,
          internalType: "bytes32",
        },
        {
          name: "account",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "sender",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "AccessControlBadConfirmation",
      inputs: [],
    },
    {
      type: "error",
      name: "AccessControlEnforcedDefaultAdminDelay",
      inputs: [
        {
          name: "schedule",
          type: "uint48",
          internalType: "uint48",
        },
      ],
    },
    {
      type: "error",
      name: "AccessControlEnforcedDefaultAdminRules",
      inputs: [],
    },
    {
      type: "error",
      name: "AccessControlInvalidDefaultAdmin",
      inputs: [
        {
          name: "defaultAdmin",
          type: "address",
          internalType: "address",
        },
      ],
    },
    {
      type: "error",
      name: "AccessControlUnauthorizedAccount",
      inputs: [
        {
          name: "account",
          type: "address",
          internalType: "address",
        },
        {
          name: "neededRole",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
    },
  ],
  rebalancerAbi: [
    {
      type: "function",
      name: "INITIATE_CLOSE_TYPEHASH",
      inputs: [],
      outputs: [
        {
          name: "typehash_",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "MAX_ACTION_COOLDOWN",
      inputs: [],
      outputs: [
        {
          name: "cooldown_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "MAX_CLOSE_DELAY",
      inputs: [],
      outputs: [
        {
          name: "closeDelay_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "MULTIPLIER_FACTOR",
      inputs: [],
      outputs: [
        {
          name: "factor_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "domainSeparatorV4",
      inputs: [],
      outputs: [
        {
          name: "domainSeparator_",
          type: "bytes32",
          internalType: "bytes32",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getAsset",
      inputs: [],
      outputs: [
        {
          name: "asset_",
          type: "address",
          internalType: "contract IERC20Metadata",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getCloseLockedUntil",
      inputs: [],
      outputs: [
        {
          name: "timestamp_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getCurrentStateData",
      inputs: [],
      outputs: [
        {
          name: "pendingAssets_",
          type: "uint128",
          internalType: "uint128",
        },
        {
          name: "maxLeverage_",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPosId_",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getLastLiquidatedVersion",
      inputs: [],
      outputs: [
        {
          name: "version_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getMinAssetDeposit",
      inputs: [],
      outputs: [
        {
          name: "minAssetDeposit_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getNonce",
      inputs: [
        {
          name: "user",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "nonce_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPendingAssetsAmount",
      inputs: [],
      outputs: [
        {
          name: "pendingAssetsAmount_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPositionData",
      inputs: [
        {
          name: "version",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [
        {
          name: "positionData_",
          type: "tuple",
          internalType: "struct IRebalancerTypes.PositionData",
          components: [
            {
              name: "amount",
              type: "uint128",
              internalType: "uint128",
            },
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "entryAccMultiplier",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPositionMaxLeverage",
      inputs: [],
      outputs: [
        {
          name: "maxLeverage_",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPositionVersion",
      inputs: [],
      outputs: [
        {
          name: "version_",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTimeLimits",
      inputs: [],
      outputs: [
        {
          name: "timeLimits_",
          type: "tuple",
          internalType: "struct IRebalancerTypes.TimeLimits",
          components: [
            {
              name: "validationDelay",
              type: "uint64",
              internalType: "uint64",
            },
            {
              name: "validationDeadline",
              type: "uint64",
              internalType: "uint64",
            },
            {
              name: "actionCooldown",
              type: "uint64",
              internalType: "uint64",
            },
            {
              name: "closeDelay",
              type: "uint64",
              internalType: "uint64",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUsdnProtocol",
      inputs: [],
      outputs: [
        {
          name: "protocol_",
          type: "address",
          internalType: "contract IUsdnProtocol",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getUserDepositData",
      inputs: [
        {
          name: "user",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "data_",
          type: "tuple",
          internalType: "struct IRebalancerTypes.UserDeposit",
          components: [
            {
              name: "initiateTimestamp",
              type: "uint40",
              internalType: "uint40",
            },
            {
              name: "amount",
              type: "uint88",
              internalType: "uint88",
            },
            {
              name: "entryPositionVersion",
              type: "uint128",
              internalType: "uint128",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "increaseAssetAllowance",
      inputs: [
        {
          name: "addAllowance",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "initiateClosePosition",
      inputs: [
        {
          name: "amount",
          type: "uint88",
          internalType: "uint88",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
        {
          name: "validator",
          type: "address",
          internalType: "address payable",
        },
        {
          name: "userMinPrice",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "currentPriceData",
          type: "bytes",
          internalType: "bytes",
        },
        {
          name: "previousActionsData",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PreviousActionsData",
          components: [
            {
              name: "priceData",
              type: "bytes[]",
              internalType: "bytes[]",
            },
            {
              name: "rawIndices",
              type: "uint128[]",
              internalType: "uint128[]",
            },
          ],
        },
        {
          name: "delegationData",
          type: "bytes",
          internalType: "bytes",
        },
      ],
      outputs: [
        {
          name: "outcome_",
          type: "uint8",
          internalType: "enum IUsdnProtocolTypes.LongActionOutcome",
        },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "initiateDepositAssets",
      inputs: [
        {
          name: "amount",
          type: "uint88",
          internalType: "uint88",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "initiateWithdrawAssets",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "resetDepositAssets",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setMinAssetDeposit",
      inputs: [
        {
          name: "minAssetDeposit",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setPositionMaxLeverage",
      inputs: [
        {
          name: "newMaxLeverage",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setTimeLimits",
      inputs: [
        {
          name: "validationDelay",
          type: "uint64",
          internalType: "uint64",
        },
        {
          name: "validationDeadline",
          type: "uint64",
          internalType: "uint64",
        },
        {
          name: "actionCooldown",
          type: "uint64",
          internalType: "uint64",
        },
        {
          name: "closeDelay",
          type: "uint64",
          internalType: "uint64",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "updatePosition",
      inputs: [
        {
          name: "newPosId",
          type: "tuple",
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          name: "previousPosValue",
          type: "uint128",
          internalType: "uint128",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "validateDepositAssets",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "validateWithdrawAssets",
      inputs: [
        {
          name: "amount",
          type: "uint88",
          internalType: "uint88",
        },
        {
          name: "to",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "AssetsDeposited",
      inputs: [
        {
          name: "user",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "positionVersion",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "AssetsWithdrawn",
      inputs: [
        {
          name: "user",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ClosePositionInitiated",
      inputs: [
        {
          name: "user",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "rebalancerAmountToClose",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "amountToClose",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "rebalancerAmountRemaining",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "DepositRefunded",
      inputs: [
        {
          name: "user",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "InitiatedAssetsDeposit",
      inputs: [
        {
          name: "payer",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "to",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "amount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "timestamp",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "InitiatedAssetsWithdrawal",
      inputs: [
        {
          name: "user",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "MinAssetDepositUpdated",
      inputs: [
        {
          name: "minAssetDeposit",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PositionMaxLeverageUpdated",
      inputs: [
        {
          name: "newMaxLeverage",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "PositionVersionUpdated",
      inputs: [
        {
          name: "newPositionVersion",
          type: "uint128",
          indexed: false,
          internalType: "uint128",
        },
        {
          name: "entryAccMultiplier",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "amount",
          type: "uint128",
          indexed: false,
          internalType: "uint128",
        },
        {
          name: "positionId",
          type: "tuple",
          indexed: false,
          internalType: "struct IUsdnProtocolTypes.PositionId",
          components: [
            {
              name: "tick",
              type: "int24",
              internalType: "int24",
            },
            {
              name: "tickVersion",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "index",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "TimeLimitsUpdated",
      inputs: [
        {
          name: "validationDelay",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "validationDeadline",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "actionCooldown",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "closeDelay",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "RebalancerActionCooldown",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerActionNotValidated",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerCloseLockedUntil",
      inputs: [
        {
          name: "closeLockedUntil",
          type: "uint256",
          internalType: "uint256",
        },
      ],
    },
    {
      type: "error",
      name: "RebalancerDepositUnauthorized",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerEtherRefundFailed",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInsufficientAmount",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInvalidAddressTo",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInvalidAmount",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInvalidDelegationSignature",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInvalidMaxLeverage",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInvalidMinAssetDeposit",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerInvalidTimeLimits",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerNoPendingAction",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerUnauthorized",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerUserLiquidated",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerUserPending",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerValidateTooEarly",
      inputs: [],
    },
    {
      type: "error",
      name: "RebalancerWithdrawalUnauthorized",
      inputs: [],
    },
  ],
};
