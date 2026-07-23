type LegacyStatus = 0 | 1;

interface LegacyResponse<TData = unknown> {
    readonly status: LegacyStatus;
    readonly data: TData;
    readonly token?: string;
}

type LegacySuccessResponse<TData> = LegacyResponse<TData> & Readonly<{ status: 1 }>;
type LegacyFailureResponse<TData = readonly unknown[]> = LegacyResponse<TData> & Readonly<{ status: 0 }>;

export type { LegacyFailureResponse, LegacyResponse, LegacyStatus, LegacySuccessResponse };
