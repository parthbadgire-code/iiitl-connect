import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectionsGateway } from './connections.gateway';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService, ConnectionsGateway],
})
export class ConnectionsModule {}
