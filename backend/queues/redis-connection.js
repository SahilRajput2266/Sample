import IORedis from 'ioredis';

export const redisOptions=()=>({
  maxRetriesPerRequest:null,
  enableReadyCheck:true,
  ...(process.env.REDIS_TLS==='true'?{tls:{serverName:process.env.REDIS_TLS_SERVERNAME||new URL(process.env.REDIS_URL).hostname,rejectUnauthorized:process.env.REDIS_TLS_REJECT_UNAUTHORIZED!=='false'}}:{}),
});

export const createRedisConnection=()=>{
  if(!process.env.REDIS_URL)throw new Error('REDIS_URL is required');
  const connection=new IORedis(process.env.REDIS_URL,redisOptions());
  connection.on('error',error=>console.error('Redis connection error:',error.message));
  return connection;
};