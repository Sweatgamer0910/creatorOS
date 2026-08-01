-- CreateTable
CREATE TABLE "channel_check_lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_check_lead_pkey" PRIMARY KEY ("id")
);
