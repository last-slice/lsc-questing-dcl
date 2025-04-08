export declare class XMLHttpRequest {
    ontimeout?: (err: any) => void;
    onerror?: (err: any) => void;
    onload?: () => void;
    withCredentials: any;
    requestHeaders: Record<string, any>;
    timeout?: number;
    responseHeadersRaw?: string;
    status?: number;
    statusText?: string;
    response?: any;
    url?: string;
    method?: string;
    constructor();
    getAllResponseHeaders(): string | undefined;
    setRequestHeader(key: string, val: any): void;
    open(method: string, url: string): void;
    send(data: any): void;
}
