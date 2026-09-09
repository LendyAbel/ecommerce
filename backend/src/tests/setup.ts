process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRET_KEY = 'sk_test_jest';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_jest';
