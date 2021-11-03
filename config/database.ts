import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    type: "postgres",
    port: Number(process.env.port),
    host: process.env.host,
    username: process.env.username,
    password: process.env.password,
    database: process.env.database,
    synchronize: true
  }));
              
  
