const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
        '1FWQiwK27EnGXb6BiBMRLJvunJQZZPMcGd',
        '1GDn5X4R5vjdSvFPrq1MJubXFkMHVcFJZv',
        '3GbdoiTnQrJYatcr2nhq7MYASSCWEKmN6L',
        '3HcSp9sR23w6MxeRrLqqyDzLqThtSMaypQ',
        '3MdofQ2ouxom9MzC9kKazGUShoL5R3cVLG',
        '3Jxc4zsvEruEVAFpvwj818TfZXq5y2DLyF'
    ]
  }
}

module.exports = cexExports(config)
