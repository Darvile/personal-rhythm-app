import serverlessExpress from '@vendia/serverless-express';
import { Resource } from 'sst';
import { connectDatabase } from './config/database';
import app from './app';

// Set MongoDB URI from SST secret
process.env.MONGODB_URI = Resource.MongoUri.value;

let serverlessExpressInstance: ReturnType<typeof serverlessExpress>;

async function setup() {
  await connectDatabase();
  serverlessExpressInstance = serverlessExpress({ app });
}

const setupPromise = setup();

export const handler = async (event: unknown, context: unknown) => {
  await setupPromise;
  return serverlessExpressInstance(event, context, () => {});
};
