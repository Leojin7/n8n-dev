/*
  Warnings:

  - Changed the type of `type` on the `Node` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('INITIAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST');

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "type",
ADD COLUMN     "type" "NodeType" NOT NULL;

-- DropEnum
DROP TYPE "NodeTypes";
