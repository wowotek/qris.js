import axios from "axios";

export interface QRISResponseSuccessCreateInvoice {
    status: "success",
    data: {
        qris_content: string,
        qris_request_date: Date,
        qris_invoiceid: string,
        qris_nmid: string
    }
}

export interface QRISResponseSuccessCheckInvoiceStatus {
    status: "success",
    data: {
        qris_status: "paid",
        qris_payment_customername: string,
        qris_payment_methodby: string
    },
    qris_api_version_code: string
}

export interface QRISResponseFailed {
    status: "failed",
    data: {
        qris_status: string | "unpaid"
    }
}

type Y = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type M30 = `0${Exclude<Y, "0">}` | `1${Y}` | `2${Y}` | `30`;
type M31 = `0${Exclude<Y, "0">}` | `1${Y}` | `2${Y}` | `30` | `31`;
type FEB = `02-${`0${Exclude<Y, "0">}` | `1${Y}` | `2${Y}`}`;
type M30s = `${`04` | `06` | `09` | `11`}-${M30}`;
type M31s = `${`01` | `03` | `05` | `07` | `08` | `10` | `12`}-${M31}`;
type YR = Exclude<Exclude<`2${0 | 1}${Y}${Y}`, `200${Y}`>, `201${Y}`>
type MMDD =  M31s | M30s| FEB;
export type YYYY_MM_DD = `2019-12-31` | `${YR}-${MMDD}`;

class ____Invoice {
    private _invoiceId: string;
    private _qris_request_date: string;
    private _qris_billed_amount: number;
    private _qris_payment_customername: string;
    private _qris_payment_methodby: string;
    private _qris_api_version_code: string;

    constructor(
        invoiceId: string,
        requestDate: string,
        billed_amount: number,
        payment_customername: string,
        payment_methodby: string,
        api_version_code: string,
    ) {
        this._invoiceId = invoiceId;
        this._qris_request_date = requestDate;
        this._qris_billed_amount = billed_amount;
        this._qris_payment_customername = payment_customername;
        this._qris_payment_methodby = payment_methodby;
        this._qris_api_version_code = api_version_code;
    }

    public get invoiceId() { return this._invoiceId; }
    public get requestDate() { return this._qris_request_date; }
    public get billedAmount() { return this._qris_billed_amount; }
    public get payment_customername() { return this._qris_payment_customername; }
    public get payment_methodby() { return this._qris_payment_methodby; }
    public get api_version_code() { return this._qris_api_version_code; }
    public get reobject(): QRISResponseSuccessCheckInvoiceStatus {
        return {
            status: "success",
            data: {
                qris_status: "paid",
                qris_payment_customername: this._qris_payment_customername,
                qris_payment_methodby: this._qris_payment_methodby,
            },
            qris_api_version_code: this._qris_api_version_code,
        }
    }
}

export class QRIS {
    private _DEVMODE: boolean;

    private _HOST: string;
    private _API_KEY: string;
    private _M_ID: number;
    
    private __MEMOIZATION_TRANSACTION_ID_LIMIT: number;
    private __MEMO_TRANSACTION_ID = new Array<[string, Date]>();
    private __MEMOIZATION_SUCCESS_INVOICES_LIMIT: number;
    private __MEMO_SUCCESS_INVOICES = new Array<[string, ____Invoice]>();

    private _PROT_API_CALL_USE: boolean;
    private _PROT_API_CALL_COUNT = 0;
    private _PROT_API_CALL_LIMIT_MAX: number;
    private _PROT_API_CALL_LIMIT_WARNING: number;
    private _PROT_API_CALL_TIMEOUT: number;
    private _PROT_API_CALL_WARNING_CALLBACK: ((useCount: number, ms: number) => void) | ((useCount: number, ms: number) => Promise<void>);
    private _PROT_API_CALL_MAX_CALLBACK: ((useCount: number, ms: number) => void) | ((useCount: number, ms: number) => Promise<void>);

    private _PROT_FIRST_CALL_DATE: Date | null = null;

    public constructor(options: {
        apikey: string,
        mID: number, 
        customHost?: string,
        devMode?: boolean,

        memoizationTransactionIdCountLimit?: number,
        memoizationSuccessInvoiceLimit?: number,

        useAPICallProtector?: boolean,
        APICallProtectorLimitMax?: number,
        APICallProtectorLimitWarning?: number,
        APICallProtectorLimitTimeout?: number,
        APICallProtectorLimitMaxCallback?: ((useCount: number, ms: number) => void) | ((useCount: number, ms: number) => Promise<void>),
        APICallProtectorLimitWarningCallback?: ((useCount: number, ms: number) => void) | ((useCount: number, ms: number) => Promise<void>)
    }) {
        this._DEVMODE = options.devMode == undefined ? false : options.devMode;
        if(options.customHost) this._HOST = options.customHost;
        else this._HOST = this._DEVMODE ? "http://localhost:8080" : "https://qris.id"
        this._API_KEY = options.apikey;
        this._M_ID = options.mID;

        this.__MEMOIZATION_TRANSACTION_ID_LIMIT = options.memoizationTransactionIdCountLimit ? options.memoizationTransactionIdCountLimit : 10000;
        this.__MEMOIZATION_SUCCESS_INVOICES_LIMIT = options.memoizationSuccessInvoiceLimit ? options.memoizationSuccessInvoiceLimit : 10000;

        this._PROT_API_CALL_USE = options.useAPICallProtector == undefined ? true : options.useAPICallProtector
        this._PROT_API_CALL_LIMIT_MAX = options.APICallProtectorLimitMax ? options.APICallProtectorLimitMax : 200;
        this._PROT_API_CALL_LIMIT_WARNING = options.APICallProtectorLimitWarning ? options.APICallProtectorLimitWarning : Math.floor(this._PROT_API_CALL_LIMIT_MAX / 1.25);
        this._PROT_API_CALL_TIMEOUT = options.APICallProtectorLimitTimeout ? options.APICallProtectorLimitTimeout : 600000 * 30;
        this._PROT_API_CALL_MAX_CALLBACK = options.APICallProtectorLimitMaxCallback ? options.APICallProtectorLimitMaxCallback : () => {return};
        this._PROT_API_CALL_WARNING_CALLBACK = options.APICallProtectorLimitWarningCallback ? options.APICallProtectorLimitWarningCallback : () => {return};
    }

    public get host() { return this._HOST }
    public get apikey() { return this._API_KEY }
    public get mID() { return this._M_ID }

    private async APICallIsAllowed() {
        if(!this._PROT_API_CALL_USE) return true;
        if(this._PROT_FIRST_CALL_DATE == null) {
            this._PROT_FIRST_CALL_DATE = new Date();
            return true;
        }

        const cd = new Date().getTime();
        const sv = this._PROT_FIRST_CALL_DATE.getTime()
        if(cd - sv >= this._PROT_API_CALL_TIMEOUT) {
            this._PROT_FIRST_CALL_DATE = new Date();
            this._PROT_API_CALL_COUNT = 0;
            return true;
        }

        let isAllowed = true;
        if(this._PROT_API_CALL_COUNT >= this._PROT_API_CALL_LIMIT_WARNING && this._PROT_API_CALL_COUNT < this._PROT_API_CALL_LIMIT_MAX){
            this._PROT_API_CALL_WARNING_CALLBACK(this._PROT_API_CALL_COUNT, cd - sv);
        }
        
        if(this._PROT_API_CALL_COUNT >= this._PROT_API_CALL_LIMIT_MAX) {
            this._PROT_API_CALL_MAX_CALLBACK(this._PROT_API_CALL_COUNT, cd - sv);
            isAllowed = false;
        }

        if(isAllowed) {
            this._PROT_API_CALL_COUNT++;
            return true;
        }
        return false;
    }

    private async memoiTransactionId(transactionId: string) {
        const date = new Date();
        date.setSeconds(date.getSeconds() - 30);
        this.__MEMO_TRANSACTION_ID.push([transactionId, date]);
        
        if(this.__MEMOIZATION_TRANSACTION_ID_LIMIT < 0) return;
        if(this.__MEMO_TRANSACTION_ID.length >= this.__MEMOIZATION_TRANSACTION_ID_LIMIT) {
            this.__MEMO_TRANSACTION_ID.shift()
        }
    }

    private async checkIfTransactionIdExist(transactionId: string) {
        for(const [memoiID, date] of this.__MEMO_TRANSACTION_ID) {
            if(memoiID == transactionId) {
                if(this._DEVMODE) console.error(
                    `TransactionID: ${transactionId} already used in ${date.toISOString().replace("Z", " ").replace("T", "").split(".")}, please use new one!`
                    );
                return true;
            }
        }
        return false;
    }

    private async memoiSuccessInvoice(
        invoiceId: string,
        requestDate: string,
        billed_amount: number,
        payment_customername: string,
        payment_methodby: string,
        api_version_code: string
    ) {
        const inv = new ____Invoice(
            invoiceId,
            requestDate,
            billed_amount,
            payment_customername,
            payment_methodby,
            api_version_code
        )
        this.__MEMO_SUCCESS_INVOICES.push([invoiceId, inv]);

        if(this.__MEMOIZATION_SUCCESS_INVOICES_LIMIT < 0) return;
        if(this.__MEMO_SUCCESS_INVOICES.length >= this.__MEMOIZATION_SUCCESS_INVOICES_LIMIT) {
            this.__MEMO_SUCCESS_INVOICES.shift()
        }
    }

    private async getMemoidSuccesInvoice(invoiceId: string, requestDate: string, billedAmount: number) {
        for(const [iID, invoice] of this.__MEMO_SUCCESS_INVOICES) {
            if(iID != invoiceId) continue
            if(invoice.requestDate != requestDate) continue;
            if(invoice.billedAmount != billedAmount) continue;
            return invoice;
        }
        return null;
    }
    
    public async createInvoice(
        transactionId: string,
        billedAmount: number
    ) {
        if(await this.checkIfTransactionIdExist(transactionId)) throw {
            status: "failed",
            data: {
                qris_status: `transaction_id_already_exist`
            }
        }

        if(!(await this.APICallIsAllowed())) throw {
            status: "failed",
            data: {
                qris_status: `api_call_limit_reached`
            }
        }

        const [status, res] = await axios
            .get(
                `${this._HOST}/restapi/qris/show_qris.php`,
                {
                    params: {
                        do: "create-invoice",
                        apikey: this._API_KEY,
                        mID: this._M_ID,
                        cliTrxNumber: transactionId,
                        cliTrxAmount: billedAmount
                    }
                }
            )
            .then(async res => {
                await this.memoiTransactionId(transactionId);
                const parsed: QRISResponseSuccessCreateInvoice = {
                    status: res.data.status,
                    data: {
                        qris_content: res.data.data.qris_content,
                        qris_request_date: res.data.data.qris_request_date,
                        qris_invoiceid: res.data.data.qris_invoiceid,
                        qris_nmid: res.data.data.qris_nmid
                    }
                }
                
                return [true, parsed];
            })
            .catch(async err => {
                const parsed: QRISResponseFailed = {
                    status: err.response.data.status,
                    data: {
                        qris_status: err.response.data.data.qris_status
                    }
                }
    
                return [false, parsed]
            });
    
        if(status) return res as QRISResponseSuccessCreateInvoice;
        throw res as QRISResponseFailed
    }
    
    public async checkStatusInvoice(
        QRISInvoiceId: string,
        QRISRequestDate: Date | YYYY_MM_DD,
        billedAmount: number,
    ) {
        let date = "";
        if(typeof(QRISRequestDate) == "string") {
            date = QRISRequestDate;
        } else {
            date = QRISRequestDate.toISOString().replace("T", " ").replace("Z", "").split(".")[0].split(" ")[0];
        }

        const memoidInvoice = await this.getMemoidSuccesInvoice(QRISInvoiceId, date, billedAmount);
        if(memoidInvoice) return memoidInvoice.reobject;

        if(!(await this.APICallIsAllowed())) throw {
            status: "failed",
            data: {
                qris_status: `api_call_limit_reached`
            }
        }

        const [status, res] = await axios
            .get(
                `${this._HOST}/restapi/qris/checkpaid_qris.php`,
                {
                    params: {
                        do: "create-invoice",
                        apikey: this._API_KEY,
                        mID: this._M_ID,
                        invid: QRISInvoiceId,
                        trxvalue: billedAmount,
                        trxdate: date
                    }
                }
            )
            .then(async res => {
                const parsed: QRISResponseSuccessCheckInvoiceStatus = {
                    status: res.data.status,
                    data: {
                        qris_status: res.data.data.qris_content,
                        qris_payment_customername: res.data.data.qris_request_date,
                        qris_payment_methodby: res.data.data.qris_payment_methodby
                    },
                    qris_api_version_code: res.data.qris_api_version_code
                } 
                await this.memoiSuccessInvoice(
                    QRISInvoiceId,
                    date,
                    billedAmount,
                    parsed.data.qris_payment_customername,
                    parsed.data.qris_payment_methodby,
                    parsed.qris_api_version_code
                );
                return [true, parsed];
            })
            .catch(async err => {
                const parsed = {
                    status: err.response.data.status,
                    data: {
                        qris_status: err.response.data.data.qris_status
                    }
                }
    
                return [false, parsed]
            });
    
        if(status) return res as QRISResponseSuccessCheckInvoiceStatus;
        throw res as QRISResponseFailed
    }
}

export default QRIS