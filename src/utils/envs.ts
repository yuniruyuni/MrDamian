type Env = "production" | "development";

export function getEnv(): Env {
    if( process.env.NODE_ENV !== 'development' ) {
        return "production";
    }
    return "development";
}

export function isProd(): boolean {
    return getEnv() === 'production';
}

export function isDev(): boolean {
    return getEnv() === 'development';
}
