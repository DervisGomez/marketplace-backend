type RequestBody = Readonly<Record<string, unknown>>;
type RequestParams = Readonly<Record<string, string>>;
type RequestQueryValue = string | readonly string[] | undefined;
type RequestQuery = Readonly<Record<string, RequestQueryValue>>;

interface LegacyRequest<TBody extends RequestBody = RequestBody> {
    readonly body: TBody;
    readonly params: RequestParams;
    readonly query: RequestQuery;
    readonly token?: string;
    readonly user?: Readonly<Record<string, unknown>>;
}

export type { LegacyRequest, RequestBody, RequestParams, RequestQuery, RequestQueryValue };
