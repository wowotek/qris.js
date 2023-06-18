# qris.js

Projek Wrapper non-official untuk integrasi QRIS Payment Gateway.


## Usage

1. Install
    ```
    npm install --save qris.js
    ```
2. Quick start
    ```js
    const QRIS = require("qris.js");

    const API_KEY = "YOUR_API_KEY_HERE";
    const M_ID = 123456 // your M_ID Here
    const QRISClient = new QRIS({ apikey: API_KEY, mID: M_ID });

    QRISClient.createInvoice("unique_transaction_id", 15_000)
        .then(createdInvoice => QRISClient.checkStatusInvoice(
                createdInvoice.data.qris_invoiceid,
                createdInvoice.data.request_date.split(".")[0]
                15_000
            )
            .then(invoiceStatus => {
                console.log(invoiceStatus)
            }
        ))
        .catch(err => {
            console.err(err);
        });
    ```