-- AlterTable
ALTER TABLE `customer` ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `last_active` DATETIME(3) NULL,
    ADD COLUMN `total_spent` DOUBLE NULL,
    ADD COLUMN `visits` INTEGER NULL;
