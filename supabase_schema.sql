-- SQL Schema for NDV Money App
-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  "fullName" TEXT,
  "idNumber" TEXT,
  balance NUMERIC DEFAULT 0,
  "totalLimit" NUMERIC DEFAULT 0,
  rank TEXT DEFAULT 'standard',
  "rankProgress" NUMERIC DEFAULT 0,
  "isLoggedIn" BOOLEAN DEFAULT false,
  "isAdmin" BOOLEAN DEFAULT false,
  "pendingUpgradeRank" TEXT,
  "rankUpgradeBill" TEXT,
  "payosCheckoutUrl" TEXT,
  "payosOrderCode" BIGINT,
  "payosAmount" NUMERIC,
  "payosExpireAt" BIGINT,
  address TEXT,
  "joinDate" TEXT,
  "idFront" TEXT,
  "idBack" TEXT,
  "refZalo" TEXT,
  relationship TEXT,
  password TEXT,
  "lastLoanSeq" INTEGER DEFAULT 0,
  "bankName" TEXT,
  "bankAccountNumber" TEXT,
  "bankAccountHolder" TEXT,
  "hasJoinedZalo" BOOLEAN DEFAULT false,
  "updatedAt" BIGINT
);

-- 2. Loans Table
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(id),
  "userName" TEXT,
  amount NUMERIC NOT NULL,
  date TEXT,
  "createdAt" TEXT,
  status TEXT NOT NULL,
  fine NUMERIC DEFAULT 0,
  "billImage" TEXT,
  "bankTransactionId" TEXT,
  "settlementType" TEXT,
  "partialAmount" NUMERIC,
  "payosCheckoutUrl" TEXT,
  "payosOrderCode" BIGINT,
  "payosAmount" NUMERIC,
  "payosExpireAt" BIGINT,
  signature TEXT,
  "rejectionReason" TEXT,
  "principalPaymentCount" INTEGER DEFAULT 0,
  "extensionCount" INTEGER DEFAULT 0,
  "updatedAt" BIGINT
);

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(id),
  title TEXT,
  message TEXT,
  time TEXT,
  read BOOLEAN DEFAULT false,
  type TEXT
);

-- 4. Config Table (for system settings)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config values
INSERT INTO config (key, value) VALUES 
('SYSTEM_BUDGET', '30000000'),
('TOTAL_RANK_PROFIT', '0'),
('TOTAL_LOAN_PROFIT', '0'),
('MONTHLY_STATS', '[]'),
('UPGRADE_PERCENT', '10'),
('PRE_DISBURSEMENT_FEE', '10'),
('MAX_EXTENSIONS', '3'),
('FINE_RATE', '2'),
('MAX_FINE_PERCENT', '30'),
('MAX_LOAN_PER_CYCLE', '10000000'),
('MIN_SYSTEM_BUDGET', '1000000'),
('MAX_SINGLE_LOAN_AMOUNT', '10000000'),
('USER_ID_FORMAT', '"{RANDOM 4 SỐ}"')
ON CONFLICT (key) DO NOTHING;
