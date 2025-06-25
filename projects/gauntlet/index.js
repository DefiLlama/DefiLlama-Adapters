const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Counts all assets that are deposited in all vaults curated by Gauntlet.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xC684c6587712e5E7BDf9fD64415F23Bd2b05fAec',
      ],
      aera: [
        '0x7c8406384f7a5c147a6add16407803be146147e4',
        '0x3d6eef6a92b15361697698695334e98c5db91d6b',
        '0x14c79c24b2a82ce36e3f3d693aeea17e268f5a98',
        '0xf33f452d45929c25a819832a3f79efa416885ce1',
        '0x8624f61cc6e5a86790e173712afdd480fa8b73ba',
        '0xd243c77814729b0b5d351966c3ebf0ab852d2cde',
        '0xaa1fb27fafff6010f963e610d0e2e00c665c5898',
        '0xb6d391b63447774523a6f391d8b4703f102ee57d',
        '0xff8432ea93ce82ef9a8a7fbd2ed160ad9eda732e',
        '0x321301f1b2b3f6a67df4b581d7e7ebd205a021d9',
        '0x8d7c89fbc143406f257cf12213a26066f2c64503',
        '0xa12f2ae0287ebba60bd54da11a01cbf769fd7027',
        '0x564bc596affd8eb9c5065bc37835d801f3830c9e',
        '0x9ecf0d8dcc0076dd153749bece0762acae1c9049',
        '0x296448fd860f94509a0d8d07226b65c6f0210852',
        '0x8447d80cd573922cb34a8e40e64533ef7d650e1f',
        '0xba0ffe7a6122e13c38d9a81ee30dc71eb4e9ad96',
        '0xfc57d3c100deec9940d5078a75fc0462f88b10fa',
        '0x6c25ae178ac3466a63a552d4d6509c3d7385a0b8',
        '0xd065f89b0d379cce0bc375f8dafde01fb9af6f5a',
        '0x5b0c6067a60055eae107f1363b597d67d023175a',
        '0x63b036eb8c38e71fca531f30f411ac805ce550b5',
        '0x8697b83daa544e55a568163af14666f7383d993b',
        '0x66b08c35a0fd624e420add6b21cc66fa81f3e5b3',
        '0x8c8fb9957ef787d273f4fa200371a2c235c6c63e',
        '0x8fc3df1cd63d62959eafc164d803b9a51e8765a1',
        '0xe6a185896c861fa61175b54de752978c374e4507',
        '0xf60c7aa098ac3be4f3532034dd2a49e068d333d4',
        '0x9f1210a391c6186c5b85ac9e09ca220092c1289f',
        '0x744bff6ca503955d87fa6a90b866d8f952805c43',
        '0x47562b3738c439b80fe4012e6d40c8acb51ce136',
        '0x17a6f4e1fdb26b3355f240530a25bb78f43e1287',
        '0x2e2e57bb1272acb11a5a0da677ddbcb8c9906255',
        '0x2c9f8043d4b6a37489eea91437c14d206acddeb9',
      ],
      symbiotic: [
        '0xc10A7f0AC6E3944F4860eE97a937C51572e3a1Da',
        '0xB8Fd82169a574eB97251bF43e443310D33FF056C',
        '0xaF07131C497E06361dc2F75de63dc1d3e113f7cb',
        '0x81bb35c4152B605574BAbD320f8EABE2871CE8C6',
        '0x65B560d887c010c4993C8F8B36E595C171d69D63',
        '0x3ba6930bac1630873f5fd206e293ca543fcea7a2',
        '0x9e405601B645d3484baeEcf17bBF7aD87680f6e8',
      ],
      mellow: [
        '0x8327b8BD2561d28F914931aD57370d62C7968e40',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0x5a4E19842e09000a582c20A4f524C26Fb48Dd4D0',
        '0xFd144f7A189DBf3c8009F18821028D1CF3EF2428',
      ],
      aera: [
        '0x9f3ef866e769624d9a7a687a669d226c1e327b4d',
        '0xcd971b604d1ac4882f8720f5e1270f8b18c91de4',
        '0x318be682bbbd0cfd07b276706e86e10f221f79b6',
        '0x76f8022dbd50e8228967b8a71a14c08870498c32',
        '0xb013ea0b7e6be494d930291503de2354902ae607',
        '0xa97da897855443f839cc52ab816bc334096c5ada',
        '0xc9e979f8b74c02953eeb4aaaf1f7e52cecfbfbcc',
        '0x67107e64e4ebed8f16c96f2ddf26cb731261fe2f',
        '0xa187de2d347070be563417ac1fe100a45a3924ce',
        '0x280218bcdef1cee7036a884f61baccf5f935fd87',
        '0xd8c5efd74dd4060ce983cbb051dcda881bbd25fb',
        '0x0baafdbe8a709f5d9d586db916e907f82f2d474d',
        '0xe4cc837ceb5631d442de23c357ab50f05f113f58',
        '0xb053805a64c50ed2a51a6d80a28000e3419be09d',
        '0xdb223128a4524ce733c575421267dc56992c796d',
        '0x70f6fd99a43fce03648b20d44b9f0cd2b14eea68',
        '0x94bca6d21907b8275daa3803fe432cd916c4fdd2',
        '0x94bca6d21907b8275daa3803fe432cd916c4fdd2',
      ]
    },
    polygon: {
      morphoVaultOwners: [
        '0xC684c6587712e5E7BDf9fD64415F23Bd2b05fAec',
      ],
    },
    unichain: {
      morphoVaultOwners: [
        '0x9E33faAE38ff641094fa68c65c2cE600b3410585',
        '0x5a4E19842e09000a582c20A4f524C26Fb48Dd4D0',
      ],
    },
    hyperliquid: {
      morphoVaultOwners: [
        '0x09346F40e324458A8E211C5317981C78FAcDEc57',
        '0xB47f11484e19f1914D32fd393b17671221C10F1F',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
