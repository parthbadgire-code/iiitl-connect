import { Module } from '@nestjs/common';
import { PlacementsController } from './placements.controller';
import { PlacementsService } from './placements.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PlacementsController],
  providers: [PlacementsService],
})
export class PlacementsModule {}
