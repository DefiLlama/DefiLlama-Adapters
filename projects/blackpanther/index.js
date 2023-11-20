const { sumTokens, } = require('../helper/chain/cosmos')

async function tvl() {
  const owners = [
    "inj10ahageqx7guq38w3xylmrjf8vm632x76t6l5ef",
      "inj1yq8scr85pfwwdq240pa3gq2gsht5echnf223yp",
      "inj1uf2gyjzxy4l3xt7u4sg3t3x2nl4dfarugzcv74",
      "inj1yy2unvp0v49yqp8y6menjvsxd3w7720pusgt97",
      "inj12azrw3jjpnu05wd2mfpamfwse268qdgl32fnmq",
      "inj1vh4j56pf5x4sp8a3xklj0v3sq73y6cs4qvul7s",
      "inj1rcjtkmfyymcdm03alslr890khuzmzn7jxy5zgt",
      "inj1jtvgvktz7vx7yvk04ahwg54h0rd6llfknns20m",
      "inj1u22ygdfu4vq5yvcqlum7u77ac20re7hz4uxc6h",
      "inj1mrfsm3c8psn6vaznxh7ewgsp4zn5vldaq54lqu",
      "inj1tp74rgd77mx4p220ha6xrcg06aggzrvud07ywu",
      "inj1tpcndvzwzj6j6uwp5wjlcpuckt8xmu0u4g3gxz",
      "inj18ajpc3efy3paw33wyaneemextlsrn28ffz9u50",
      "inj1uau2h4wmhw5fxut3snljlc3mwska30wm306rwu",
      "inj1cqsvgveztn7lj0p9r7kpxnhrq0ej8uypy0qe7y",
      "inj1qgy5qp7f4vtsyf8zquqh4xs3v26ty4mu4vk2zg",
      "inj1u4lwvfmpvquwe3h327jtrdkm53ydlvxjq26nn8",
      "inj1zxcznn4pfdrmxzdu09xk9su69c57rkhrpdrm7j",
      "inj1fjyu363jv742yuns62ez2zcyr4aas26m3ktenx",
      "inj1p0rh33f2htvhjnyudgvz262hjlqwfgraruqenv"
  ]
  return sumTokens({ owners, chain: 'injective' })
}

module.exports = {
  injective: {
    tvl,
  },
}