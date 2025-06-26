const rigAbi = {
  programType: "contract",
  specVersion: "1",
  encodingVersion: "1",
  concreteTypes: [
    {
      type: "()",
      concreteTypeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
    },
    {
      type: "b256",
      concreteTypeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
    },
    {
      type: "bool",
      concreteTypeId: "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
    },
    {
      type: "enum errors::RigError",
      concreteTypeId: "c78ac89d0034509430ed0e0a71dc58ebc9c628a01e37fd6046dcc7cfcfc2d411",
      metadataTypeId: 1,
    },
    {
      type: "enum standards::src5::AccessError",
      concreteTypeId: "3f702ea3351c9c1ece2b84048006c8034a24cbc2bad2e740d0412b4172951d3d",
      metadataTypeId: 2,
    },
    {
      type: "enum standards::src5::State",
      concreteTypeId: "192bc7098e2fe60635a9918afb563e4e5419d386da2bdbf0d716b4bc8549802c",
      metadataTypeId: 3,
    },
    {
      type: "enum std::identity::Identity",
      concreteTypeId: "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
      metadataTypeId: 4,
    },
    {
      type: "enum std::option::Option<enum std::identity::Identity>",
      concreteTypeId: "253aea1197e8005518365bd24c8bc31f73a434fac0f7350e57696edfdd4850c2",
      metadataTypeId: 5,
      typeArguments: ["ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335"],
    },
    {
      type: "enum std::option::Option<struct std::asset_id::AssetId>",
      concreteTypeId: "191bf2140761b3c5ab6c43992d162bb3dc9d7f2272b2ee5f5eeea411ddedcd32",
      metadataTypeId: 5,
      typeArguments: ["c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"],
    },
    {
      type: "enum std::option::Option<struct std::string::String>",
      concreteTypeId: "7c06d929390a9aeeb8ffccf8173ac0d101a9976d99dda01cce74541a81e75ac0",
      metadataTypeId: 5,
      typeArguments: ["9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c"],
    },
    {
      type: "enum std::option::Option<u64>",
      concreteTypeId: "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
      metadataTypeId: 5,
      typeArguments: ["1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"],
    },
    {
      type: "enum std::option::Option<u8>",
      concreteTypeId: "2da102c46c7263beeed95818cd7bee801716ba8303dddafdcd0f6c9efda4a0f1",
      metadataTypeId: 5,
      typeArguments: ["c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b"],
    },
    {
      type: "enum sway_libs::asset::errors::SetMetadataError",
      concreteTypeId: "c6c09c148c1a1341c7ab81697b3545cc695fa67668a169cddc59790a9a0b6b44",
      metadataTypeId: 6,
    },
    {
      type: "enum sway_libs::ownership::errors::InitializationError",
      concreteTypeId: "1dfe7feadc1d9667a4351761230f948744068a090fe91b1bc6763a90ed5d3893",
      metadataTypeId: 7,
    },
    {
      type: "enum sway_libs::reentrancy::errors::ReentrancyError",
      concreteTypeId: "4d216c57b3357523323f59401c7355785b41bdf832f6e1106272186b94797038",
      metadataTypeId: 8,
    },
    {
      type: "str[18]",
      concreteTypeId: "58917167d101d95177bf16f9bb6db90f521ee1af6337127222eda49f2066c4bb",
    },
    {
      type: "str[6]",
      concreteTypeId: "ed705f920eb2c423c81df912430030def10f03218f0a064bfab81b68de71ae21",
    },
    {
      type: "struct events::DepositEvent",
      concreteTypeId: "aeb9b947da259c606e2c25be1150e2150f609fe5f2ec593c9a7ebb771e4e7065",
      metadataTypeId: 11,
    },
    {
      type: "struct events::InitialSetupEvent",
      concreteTypeId: "f3e3dd99686bcd3fd6cb9950ef677dd949eb46930ebf6a28c740028bc29ba25d",
      metadataTypeId: 12,
    },
    {
      type: "struct events::OperatorAddressUpdatedEvent",
      concreteTypeId: "209e9e29f72e5132f202c0d679b51ef0dcf2b75f72b144f6cb2a644b65ada95d",
      metadataTypeId: 13,
    },
    {
      type: "struct events::PausedUpdateEvent",
      concreteTypeId: "51e627badf42837aa5c0d9b84a0ac4485618106a1e70d522a9a60a7b3a776add",
      metadataTypeId: 14,
    },
    {
      type: "struct events::PauserUpdateEvent",
      concreteTypeId: "7f71313a989dcbc4a0cfd478ede8cf0cc493f743e6741fd3926f6df32da25a53",
      metadataTypeId: 15,
    },
    {
      type: "struct events::SetL1RigAddressEvent",
      concreteTypeId: "bd356da786bf056741dae29349ade6added8ddfb7370912d7f9af454973dfbd3",
      metadataTypeId: 16,
    },
    {
      type: "struct events::SetMaxStaleTimeEvent",
      concreteTypeId: "1736851d1d585cde3bf8c5098ba201f269aca4acc8a509ad34bc32afdad54626",
      metadataTypeId: 17,
    },
    {
      type: "struct events::SetPriceFeedContractEvent",
      concreteTypeId: "220dc82b54b16dd24a373f74b0115fa7c583b360b5a3a8086e36e6ae32142ceb",
      metadataTypeId: 18,
    },
    {
      type: "struct events::WithdrawEvent",
      concreteTypeId: "9787083b0003f388ec6bf30609ff6a10c76fada67314a162841a445b07a17168",
      metadataTypeId: 19,
    },
    {
      type: "struct standards::src20::SetDecimalsEvent",
      concreteTypeId: "fbe071a6e7ca2b2b5e503e82638f9f11c861a6fb452b65473eca8260db87392d",
      metadataTypeId: 20,
    },
    {
      type: "struct standards::src20::SetNameEvent",
      concreteTypeId: "6ce295b0fb4c1c15e8ed1cfa4babda47d8a04940a5266a3229e12243a2e37c2c",
      metadataTypeId: 21,
    },
    {
      type: "struct standards::src20::SetSymbolEvent",
      concreteTypeId: "a8a4b78066c51a50da6349bd395fe1c67e774d75c1db2c5c22288a432d7a363d",
      metadataTypeId: 22,
    },
    {
      type: "struct std::asset_id::AssetId",
      concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      metadataTypeId: 24,
    },
    {
      type: "struct std::contract_id::ContractId",
      concreteTypeId: "29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54",
      metadataTypeId: 27,
    },
    {
      type: "struct std::string::String",
      concreteTypeId: "9a7f1d3e963c10e0a4ea70a8e20a4813d1dc5682e28f74cb102ae50d32f7f98c",
      metadataTypeId: 28,
    },
    {
      type: "struct sway_libs::ownership::events::OwnershipSet",
      concreteTypeId: "e1ef35033ea9d2956f17c3292dea4a46ce7d61fdf37bbebe03b7b965073f43b5",
      metadataTypeId: 29,
    },
    {
      type: "struct sway_libs::ownership::events::OwnershipTransferred",
      concreteTypeId: "b3fffbcb3158d7c010c31b194b60fb7857adb4ad61bdcf4b8b42958951d9f308",
      metadataTypeId: 30,
    },
    {
      type: "u64",
      concreteTypeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
    },
    {
      type: "u8",
      concreteTypeId: "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b",
    },
  ],
  metadataTypes: [
    {
      type: "(_, _)",
      metadataTypeId: 0,
      components: [
        {
          name: "__tuple_element",
          typeId: 24,
        },
        {
          name: "__tuple_element",
          typeId: 24,
        },
      ],
    },
    {
      type: "enum errors::RigError",
      metadataTypeId: 1,
      components: [
        {
          name: "BadAsset",
          typeId: 0,
        },
        {
          name: "BadMigration",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "AlreadyInitialized",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "NotInitialized",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "Overflow",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "NoStakingDeposits",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "NotOperator",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "RigIsPaused",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "RigIsNotPaused",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "InvalidPauser",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "PriceIsStale",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "InsufficientAmountOut",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "enum standards::src5::AccessError",
      metadataTypeId: 2,
      components: [
        {
          name: "NotOwner",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "enum standards::src5::State",
      metadataTypeId: 3,
      components: [
        {
          name: "Uninitialized",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "Initialized",
          typeId: 4,
        },
        {
          name: "Revoked",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "enum std::identity::Identity",
      metadataTypeId: 4,
      components: [
        {
          name: "Address",
          typeId: 23,
        },
        {
          name: "ContractId",
          typeId: 27,
        },
      ],
    },
    {
      type: "enum std::option::Option",
      metadataTypeId: 5,
      components: [
        {
          name: "None",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "Some",
          typeId: 9,
        },
      ],
      typeParameters: [9],
    },
    {
      type: "enum sway_libs::asset::errors::SetMetadataError",
      metadataTypeId: 6,
      components: [
        {
          name: "EmptyString",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
        {
          name: "EmptyBytes",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "enum sway_libs::ownership::errors::InitializationError",
      metadataTypeId: 7,
      components: [
        {
          name: "CannotReinitialized",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "enum sway_libs::reentrancy::errors::ReentrancyError",
      metadataTypeId: 8,
      components: [
        {
          name: "NonReentrant",
          typeId: "2e38e77b22c314a449e91fafed92a43826ac6aa403ae6a8acb6cf58239fbaf5d",
        },
      ],
    },
    {
      type: "generic T",
      metadataTypeId: 9,
    },
    {
      type: "raw untyped ptr",
      metadataTypeId: 10,
    },
    {
      type: "struct events::DepositEvent",
      metadataTypeId: 11,
      components: [
        {
          name: "sender",
          typeId: 4,
        },
        {
          name: "referral",
          typeId: 5,
          typeArguments: [
            {
              name: "",
              typeId: 4,
            },
          ],
        },
        {
          name: "amount_deposited",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
        {
          name: "amount_minted",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct events::InitialSetupEvent",
      metadataTypeId: 12,
      components: [
        {
          name: "l1_rig_address",
          typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
        },
        {
          name: "initial_owner",
          typeId: 4,
        },
        {
          name: "pauser",
          typeId: 4,
        },
        {
          name: "max_stale_time",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct events::OperatorAddressUpdatedEvent",
      metadataTypeId: 13,
      components: [
        {
          name: "operator_address",
          typeId: 4,
        },
        {
          name: "is_operator",
          typeId: "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
        },
      ],
    },
    {
      type: "struct events::PausedUpdateEvent",
      metadataTypeId: 14,
      components: [
        {
          name: "paused",
          typeId: "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
        },
      ],
    },
    {
      type: "struct events::PauserUpdateEvent",
      metadataTypeId: 15,
      components: [
        {
          name: "pauser",
          typeId: 4,
        },
      ],
    },
    {
      type: "struct events::SetL1RigAddressEvent",
      metadataTypeId: 16,
      components: [
        {
          name: "l1_rig_address",
          typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
        },
      ],
    },
    {
      type: "struct events::SetMaxStaleTimeEvent",
      metadataTypeId: 17,
      components: [
        {
          name: "max_stale_time",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct events::SetPriceFeedContractEvent",
      metadataTypeId: 18,
      components: [
        {
          name: "price_feed_contract",
          typeId: 27,
        },
      ],
    },
    {
      type: "struct events::WithdrawEvent",
      metadataTypeId: 19,
      components: [
        {
          name: "amount_withdrawn",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct standards::src20::SetDecimalsEvent",
      metadataTypeId: 20,
      components: [
        {
          name: "asset",
          typeId: 24,
        },
        {
          name: "decimals",
          typeId: "c89951a24c6ca28c13fd1cfdc646b2b656d69e61a92b91023be7eb58eb914b6b",
        },
        {
          name: "sender",
          typeId: 4,
        },
      ],
    },
    {
      type: "struct standards::src20::SetNameEvent",
      metadataTypeId: 21,
      components: [
        {
          name: "asset",
          typeId: 24,
        },
        {
          name: "name",
          typeId: 5,
          typeArguments: [
            {
              name: "",
              typeId: 28,
            },
          ],
        },
        {
          name: "sender",
          typeId: 4,
        },
      ],
    },
    {
      type: "struct standards::src20::SetSymbolEvent",
      metadataTypeId: 22,
      components: [
        {
          name: "asset",
          typeId: 24,
        },
        {
          name: "symbol",
          typeId: 5,
          typeArguments: [
            {
              name: "",
              typeId: 28,
            },
          ],
        },
        {
          name: "sender",
          typeId: 4,
        },
      ],
    },
    {
      type: "struct std::address::Address",
      metadataTypeId: 23,
      components: [
        {
          name: "bits",
          typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
        },
      ],
    },
    {
      type: "struct std::asset_id::AssetId",
      metadataTypeId: 24,
      components: [
        {
          name: "bits",
          typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
        },
      ],
    },
    {
      type: "struct std::bytes::Bytes",
      metadataTypeId: 25,
      components: [
        {
          name: "buf",
          typeId: 26,
        },
        {
          name: "len",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct std::bytes::RawBytes",
      metadataTypeId: 26,
      components: [
        {
          name: "ptr",
          typeId: 10,
        },
        {
          name: "cap",
          typeId: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
        },
      ],
    },
    {
      type: "struct std::contract_id::ContractId",
      metadataTypeId: 27,
      components: [
        {
          name: "bits",
          typeId: "7c5ee1cecf5f8eacd1284feb5f0bf2bdea533a51e2f0c9aabe9236d335989f3b",
        },
      ],
    },
    {
      type: "struct std::string::String",
      metadataTypeId: 28,
      components: [
        {
          name: "bytes",
          typeId: 25,
        },
      ],
    },
    {
      type: "struct sway_libs::ownership::events::OwnershipSet",
      metadataTypeId: 29,
      components: [
        {
          name: "new_owner",
          typeId: 4,
        },
      ],
    },
    {
      type: "struct sway_libs::ownership::events::OwnershipTransferred",
      metadataTypeId: 30,
      components: [
        {
          name: "new_owner",
          typeId: 4,
        },
        {
          name: "previous_owner",
          typeId: 4,
        },
      ],
    },
  ],
  functions: [
    {
      inputs: [],
      name: "get_sanitized_price",
      output: "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
    {
      inputs: [
        {
          name: "asset",
          concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
        },
      ],
      name: "total_supply",
      output: "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
      attributes: [
        {
          name: "storage",
          arguments: ["read"],
        },
      ],
    },
  ],
  loggedTypes: [],
  messagesTypes: [],
  configurables: [],
};

module.exports = {
  rigAbi
}