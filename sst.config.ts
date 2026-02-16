/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pulse-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-2",
        },
      },
    };
  },
  async run() {
    // Secret for MongoDB connection string
    const mongoUri = new sst.Secret("MongoUri");

    // Cognito User Pool for authentication
    const userPool = new sst.aws.CognitoUserPool("UserPool", {
      usernames: ["email"],
      transform: {
        userPool: {
          autoVerifiedAttributes: ["email"],
        },
      },
    });
    const userPoolClient = userPool.addClient("WebClient");

    // Backend API using Lambda
    const api = new sst.aws.ApiGatewayV2("Api", {
      cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const cognitoEnv = {
      COGNITO_USER_POOL_ID: userPool.id,
      COGNITO_CLIENT_ID: userPoolClient.id,
    };

    api.route("GET /health", {
      handler: "backend/src/lambda.handler",
      link: [mongoUri],
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
        DEPLOYED_AT: new Date().toISOString(),
      },
    });

    api.route("$default", {
      handler: "backend/src/lambda.handler",
      link: [mongoUri],
      memory: "512 MB",
      timeout: "30 seconds",
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
        DEPLOYED_AT: new Date().toISOString(),
        ...cognitoEnv,
      },
    });

    // Frontend static site
    const frontend = new sst.aws.StaticSite("Frontend", {
      path: "frontend",
      build: {
        command: "npm run build",
        output: "dist",
      },
      environment: {
        VITE_API_URL: api.url,
        VITE_COGNITO_USER_POOL_ID: userPool.id,
        VITE_COGNITO_CLIENT_ID: userPoolClient.id,
        VITE_COGNITO_REGION: "ap-southeast-2",
      },
    });

    return {
      api: api.url,
      frontend: frontend.url,
      userPoolId: userPool.id,
      userPoolClientId: userPoolClient.id,
    };
  },
});
