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
      type: "enum std::option::Option<u64>",
      concreteTypeId: "d852149004cc9ec0bbe7dc4e37bffea1d41469b759512b6136f2e865a4c06e7d",
      metadataTypeId: 5,
      typeArguments: ["1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"],
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
      type: "struct std::asset_id::AssetId",
      concreteTypeId: "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      metadataTypeId: 24,
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
      type: "generic T",
      metadataTypeId: 9,
    },
    {
      type: "raw untyped ptr",
      metadataTypeId: 10,
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
      type: "struct std::string::String",
      metadataTypeId: 28,
      components: [
        {
          name: "bytes",
          typeId: 25,
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

