# qris.js

Projek Wrapper non-official untuk integrasi QRIS Payment Gateway.

## Current Status 
- ![#f03c15](https://placehold.co/15x15/f03c15/f03c15.png) **`18 June 2023`**
- ![#f03c15](https://placehold.co/15x15/f03c15/f03c15.png) **`In-development Not Working`**

## Fitur

1. Create QRIS Invoice
    - Membuat invoice sesuai dengan dokumentasi official
    yang diberikan QRIS
2. Check QRIS Invoice Status
    - Check status pembayaran invoice sesuai dengan dokumentasi official yang diberikan QRIS
3. TransactionID Memoization
    - mengingat transaction id yang sudah digunakan
    - untuk membantu mengurangi penggunaan jumlah API Calls untuk menghindari ban.
4. Success (paid) Invoice Memoization
    - mengingat invoice yang sudah sukses
    - untuk membantu mengurangi penggunaan jumlah API Calls untuk menghindari ban.
5. API Call Protection
    - Mencegah Ban dengan menghitung jumlah API Calls
    per 30 menit
    - Terdapat Warning Callback untuk mengingatkan bahwa
    API Calls sudah masuk zona warning
    - Terdapat Limit Callback untuk mengingatkan bahwa
    API Calls sudah tercegah.
6. Kustomisasi Fitur tambahan
    - **TransactionID Memoization Count**: jumlah memoization
    - **Success Invoice Memoization Count**: jumlah memoization
    - **APICallProtaction Usage**: boolean untuk menggunakan atau
    tidak fitur APICall Protection
    - **APICallProtection Max Limit**: jumlah maximum api call
    yang akan diprotect
    - **APICallProtection Warning Limit**: jumlah api call sebagai
    zona warning
    - **APICallProtection Timeout**: waktu dalam millisecond untuk
    mereset jumlah API Call.
    - **APICallProtection Warning and Limit Callback**: fungsi yang
    akan dipanggil ketika memasuki zona warning, dan ketika
    limit maksimum telah tercapai
## Pengunaan

1. Instalasi menggunakan `NPM`
    ```
    npm install --save qris.js
    ```
2. Gunakan, contoh :
    ```js
    const QRIS = require("qris.js");

    const API_KEY = "YOUR_API_KEY_HERE";
    const M_ID = 123456 // your M_ID Here
    const QRISClient = new QRIS({ apikey: API_KEY, mID: M_ID });

    QRISClient.createInvoice("unique_transaction_id", 15_000)
        .then(createdInvoice => QRISClient.checkStatusInvoice(
                createdInvoice.data.qris_invoiceid,
                createdInvoice.data.request_date.split(".")[0],
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