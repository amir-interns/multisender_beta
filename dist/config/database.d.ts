declare const _default: (() => {
    type: string;
    port: number;
    host: string;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost;
export default _default;
