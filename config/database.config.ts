import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    type: "postgres",
    port: Number(process.env.PORT),
    host: process.env.HOST,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    synchronize: true
  }));
