import connectDb from './db.js';

export default async () => {
  await connectDb();
};

