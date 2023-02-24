const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      '13jTtHxBPFwZkaCdm6BwJMMJkqvTpBZccw',
      '13rCGm4Z3PDeYwo5a7GTT4jFYnRFBZbKr1',
      '14kHu26yWkVD8qAnBfcFXHXxgquNoSpKum',
      '15Exz1BAVan4Eweagy1rcPJnfyc6KJ4GvL',
      '162z6mSSHzfTqb2Sn3NUk5r1Y2oGoCMCoM',
      '16rF2zwSJ9goQ9fZfYoti5LsUqqegb5RnA',
      '178E8tYZ5WJ6PpADdpmmZd67Se7uPhJCLX',
      '18QUDxjDZAqAJorr4jkSEWHUDGLBF9uRCc',
      '1AumBaQDRaCC3cKKQVRHeyvoSPWNdDzsKP',
      '1BsdDaJtgFZrLfzEXvh6cD4VhtHHSHhMea',
      '1CE8chGD6Nu8qjcDF2uR1wMKyoWb8Kyxwz',
      '1CY7fykRLWXeSbKB885Kr4KjQxmDdvW923',
      '1DVTB9YKi4KNjyEbAHPp17T8R1Pp17nSmA',
      '1DcT5Wij5tfb3oVViF8mA8p4WrG98ahZPT',
      '1DnHx95d2t5URq2SYvVk6kxGryvTEbTnTs',
      '1FTgXfXZRxMQcKSNeuFvWYVPsNgurTJ7BZ',
      '1FY6RL8Ju9b6CGsHTK68yYEcnzUasufyCe',
      '1FfgXrQUjX5nQ4zsiLBWjvFwW61jQHCqn',
      '1JQULE6yHr9UaitLr4wahTwJN7DaMX7W1Z',
      '1Lj2mCPJYbbC2X6oYwV6sXnE8CZ4heK5UD',
      '1LnoZawVFFQihU8d8ntxLMpYheZUfyeVAK',
      '1M6E6vPaYsuCb34mDNS2aepu2aJyL6xBG4',
      '1MbNM3jwxMjRzeA9xyHbMyePN68MY4Jxb',
      'bc1quhruqrghgcca950rvhtrg7cpd7u8k6svpzgzmrjy8xyukacl5lkq0r8l2d',
      'bc1qphk6rkypc8q64xesgy67l8n5780f2kuh286x9j5a5vje4p6mtgtqkzd2s8',
    ],
  },
  ethereum: {
    owners: [
      '0x06d3a30cbb00660b85a30988d197b1c282c6dcb6',
      '0x276cdba3a39abf9cedba0f1948312c0681e6d5fd',
      '0x313eb1c5e1970eb5ceef6aebad66b07c7338d369',
      '0x3d55ccb2a943d88d39dd2e62daf767c69fd0179f',
      '0x42436286a9c8d63aafc2eebbca193064d68068f2',
      '0x461249076b88189f8ac9418de28b365859e46bfd',
      '0x4b4e14a3773ee558b6597070797fd51eb48606e5',
      '0x4d19c0a5357bc48be0017095d3c871d9afc3f21d',
      '0x4e7b110335511f662fdbb01bf958a7844118c0d4',
      '0x5041ed759dd4afc3a72b8192c143f72f4724081a',
      '0x539c92186f7c6cc4cbf443f26ef84c595babbca1',
      '0x5c52cc7c96bde8594e5b77d5b76d042cb5fae5f2',
      '0x65a0947ba5175359bb457d3b34491edf4cbf7997',
      '0x68841a1806ff291314946eebd0cda8b348e73d6d',
      '0x69a722f0b5da3af02b4a205d6f0c285f4ed8f396',
      '0x6fb624b48d9299674022a23d92515e76ba880113',
      '0x7eb6c83ab7d8d9b8618c0ed973cbef71d1921ef2',
      '0x868dab0b8e21ec0a48b726a1ccf25826c78c6d7f',
      '0x96fdc631f02207b72e5804428dee274cf2ac0bcd',
      '0x9723b6d608d4841eb4ab131687a5d4764eb30138',
      '0x98ec059dc3adfbdd63429454aeb0c990fba4a128',
      '0xa7efae728d2936e78bda97dc267687568dd593f3',
      '0xbda23b750dd04f792ad365b5f2a6f1d8593796f2',
      '0xbf94f0ac752c739f623c463b5210a7fb2cbb420b',
      '0xbfbbfaccd1126a11b8f84c60b09859f80f3bd10f',
      '0xc3ae71fe59f5133ba180cbbd76536a70dec23d40',
      '0xc5451b523d5fffe1351337a221688a62806ad91a',
      '0xc708a1c712ba26dc618f972ad7a187f76c8596fd',
      '0xcba38020cd7b6f51df6afaf507685add148f6ab6',
      '0xcbffcb2c38ecd19468d366d392ac0c1dc7f04bb6',
      '0xe9172daf64b05b26eb18f07ac8d6d723acb48f99',
      '0xf51cd688b8744b1bfd2fba70d050de85ec4fb9fb',
      '0xf59869753f41db720127ceb8dbb8afaf89030de4',
      '0xf7858da8a6617f7c6d0ff2bcafdb6d2eedf64840',
    ],
  },
  tron:{
    owners: [
        "TCz47XgC9TjCeF4UzfB6qZbM9LTF9s1tG7",
        "TJbHp48Shg4tTD5x6fKkU7PodggL5mjcJP",
        "TM1zzNDZD2DPASbKcgdVoTYhfmYgtfwx9R",
        "TSaRZDiBPD8Rd5vrvX8a4zgunHczM9mj8S",
        "TWGZbjofbTLY3UCjCV4yiLkRg89zLqwRgi",
    ]
  },
  arbitrum:{
    owners:[
      "0x62383739d68dd0f844103db8dfb05a7eded5bbe6",
    ]
  },
  avax:{
    owners:[
      "0x7e4aa755550152a522d9578621ea22edab204308"
    ]
  },
  polygon:{
    owners:[
      "0x06959153b974d0d5fdfd87d561db6d8d4fa0bb0b",
    ]
  },
  optimism:{
    owners:[
      "0xebe80f029b1c02862b9e8a70a7e5317c06f62cae",
    ]
  }
}

module.exports = cexExports(config)
