const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    geckoId: 'bitcoin',
    addresses: [
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
      '1MbNM3jwxMjRzeA9xyHbMyePN68MY4Jxb'
    ],
    noParallel: true,
  },
  ethereum: {
    owners: [
      '0x42436286a9c8d63aafc2eebbca193064d68068f2',
      '0x461249076b88189f8ac9418de28b365859e46bfd',
      '0x4d19c0a5357bc48be0017095d3c871d9afc3f21d',
      '0x5041ed759dd4afc3a72b8192c143f72f4724081a',
      '0x5c52cc7c96bde8594e5b77d5b76d042cb5fae5f2',
      '0x65a0947ba5175359bb457d3b34491edf4cbf7997',
      '0x69a722f0b5da3af02b4a205d6f0c285f4ed8f396',
      '0xc5451b523d5fffe1351337a221688a62806ad91a',
      '0xc708a1c712ba26dc618f972ad7a187f76c8596fd',
      '0xcba38020cd7b6f51df6afaf507685add148f6ab6',
      '0xe9172daf64b05b26eb18f07ac8d6d723acb48f99',
      '0xf59869753f41db720127ceb8dbb8afaf89030de4',

    ],
  },
}

module.exports = cexExports(config)
