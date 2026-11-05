export interface IAppConfig {
  APP_PORT: number;
  APP_NODE_ENV: string;
  APP_DATABASE_URL: string;
  APP_SESSION_SECRET: string;
  APP_HASH_SALT: string;
  APP_HOST: string;
  APP_JWT_ACCESS_SECRET: string;
  APP_JWT_REFRESH_SECRET: string;
  APP_GOOGLE_CLIENT_ID: string;
  APP_GOOGLE_CLIENT_SECRET: string;
  APP_GOOGLE_REDIRECT_URI: string;
}
