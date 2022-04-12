import { mongoose } from '../utils/mongoose.js';
import configEnv from '../env/index.js';

const dbOptions = (options) => ({
  autoIndex: options.autoIndex,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  keepAlive: 1,
  connectTimeoutMS: 300000,
  socketTimeoutMS: 300000,
});

export default async () => {
  try {
    const options = {
      autoIndex: !!global.isIndexesServer,
    };
    await mongoose.connect(configEnv.db, dbOptions(options));
  } catch (error) {
    console.log('Error on connecting to db: ', error);
    console.log('\x1b[31m', '*** PLEASE CONNECT TO DATABASE BEFORE RUN SERVER', '\x1b[0m');
    process.exit(1);
  }
};
