import {} from 'dotenv/config';

export default {
  db: process.env.MONGO_URL,
  nodeEnv: process.env.NODE_ENV,
  jwt: {
    secret: process.env.JWT_SCERET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  crypto: {
    secret: process.env.SECRET,
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  host: {
    feHost: process.env.FE_HOST,
    beHost: process.env.BE_HOST,
  },
  bcrypt: {
    saltRounds: Number(process.env.SALT_ROUNDS),
  },
  sendGrid: {
    apiKey: process.env.SEND_GRID_API_KEY,
  },
};
