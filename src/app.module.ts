import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RidesModule } from './rides/rides.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entites/User';
import { Ride } from './entites/Ride';
import { ScheduleModule } from '@nestjs/schedule';
import { UserSubscriber } from './user/subscribers/user.subscriber';
import { Driver } from './entites/Driver';
import { VerficationCode } from './entites/VerificationCode';
import { DriversModule } from './drivers/drivers.module';
import { JwtModule } from '@nestjs/jwt';
import { HandlerFactoryService } from './handler-factory/handler-factory.service';
import { Transaction } from './entites/Transactions';
import { FaqModule } from './faq/faq.module';
import { FAQ } from './entites/FAQ';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './entites/Notification';
import { AppRating } from './entites/AppRating';
import { ChoosenLanguageMiddleware } from './middlewares/choosen-language/choosen-language.middleware';

import { Refactoring } from 'utils/Refactoring';
import { VoucherModule } from './voucher/voucher.module';
import { Voucher } from './entites/Vouchers';
import { ReviewService } from './review/services/review.service';
import { ReviewModule } from './review/review.module';
import { Review } from './entites/Reviews';
import { ReviewSubscriber } from './review/subscribers/review.subscriber';
import { AdminModule } from './admin/admin.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentsModule } from './payments/payments.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    EventEmitterModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      subscribers: [UserSubscriber, ReviewSubscriber],
      synchronize: process.env.SYNC === 'true',
      logging: true,
      entities: [
        User,
        Ride,
        Driver,
        VerficationCode,
        Transaction,
        FAQ,
        Notification,
        AppRating,
        Voucher,
        Review,
      ],
      // autoLoadEntities: true,
    }),
    UserModule,
    RidesModule,
    AuthModule,
    DriversModule,
    ReviewModule,
    TypeOrmModule.forFeature([Transaction, User, Driver, AppRating]),
    FaqModule,
    NotificationModule,
    VoucherModule,
    AdminModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, HandlerFactoryService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ChoosenLanguageMiddleware).forRoutes('*');
  }
}
