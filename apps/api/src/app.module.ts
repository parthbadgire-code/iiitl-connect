import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AcademicModule } from './modules/academic/academic.module';
import { SocialModule } from './modules/social/social.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [DatabaseModule, AuthModule, AcademicModule, SocialModule, ConnectionsModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
