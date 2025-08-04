import { createClient } from 'redis';

const rediClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 15687,
          reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.error("Too many Redis retries");
          return new Error("Retry limit reached");
        }
        return Math.min(retries * 100, 3000); // exponential backoff
      }
    }
});

rediClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

export default rediClient;