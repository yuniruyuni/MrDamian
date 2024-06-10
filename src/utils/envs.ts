import path from 'path';

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

export function calcPath(rel: string): string {
    switch( getEnv() ) {
    case 'development': return path.join(__dirname, '../../', rel);
    case 'production': return path.join(process.resourcesPath, rel);
    }
}
