import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AcademicModule } from './modules/academic/academic.module';
import { SocialModule } from './modules/social/social.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ClubModule } from './modules/club/club.module';
import { EventModule } from './modules/event/event.module';
import { StorageModule } from './modules/storage/storage.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { NotificationsModule } from './modules/notifications/notifications.module';


@Module({
  imports: [DatabaseModule, AuthModule, AcademicModule, SocialModule, ConnectionsModule, ProfileModule, ClubModule, EventModule, StorageModule, MarketplaceModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
