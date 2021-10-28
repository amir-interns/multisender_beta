
export default () => ({
    type: "postgres",
    port: Number(process.env.dbport),
    host: process.env.host,
    username: process.env.dbusername,
    password: process.env.dbpassword,
    database: process.env.database,
    synchronize: true
  });
              
  