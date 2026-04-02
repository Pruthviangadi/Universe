-- CreateTable
CREATE TABLE "HelpMessage" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "internalNote" TEXT,

    CONSTRAINT "HelpMessage_pkey" PRIMARY KEY ("id")
);
