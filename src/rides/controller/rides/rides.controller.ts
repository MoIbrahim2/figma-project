import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { RestrictTO } from 'src/auth/guards/restrict-to/restrict-to.guard';
import { CancelationBodyDto } from 'src/DTOs/cancelationBodyDto.dto';
import { ConfirmationTripDto } from 'src/DTOs/confirmationtTripDto.dto';
import { RequestRideDto } from 'src/DTOs/requestRideDto.dto';
import { AcceptRideInterceptor } from 'src/rides/interceptors/accept-ride/accept-ride.interceptor';
import { CaptainCancelRideInterceptor } from 'src/rides/interceptors/captain-cancel-ride/captain-cancel-ride.interceptor';
import { ClientConfirmationInterceptor } from 'src/rides/interceptors/client-confirmation-interceptor/client-confirmation.interceptor';
import { RequestRideInterceptor } from 'src/rides/interceptors/request-ride/request-ride.interceptor';

import { RidesService } from 'src/rides/services/rides/rides.service';
@UsePipes(ValidationPipe)
@Controller('rides')
export class RidesController {
  constructor(private rideService: RidesService) {}
  @UseGuards(AuthGuard, RestrictTO('user'))
  @Post('/bindingRide')
  async bindingRide(@Req() req: Request, @Body() data) {
    // return this.rideService.bindingRide(
    //   req['user'].location,
    //   req['user'].id,
    //   data.to,
    // );
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Patch('/finishRide')
  async finishRide(@Req() req: Request) {
    return this.rideService.endRide(req['user'].id);
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Patch('startRide')
  async startRide(@Req() req: Request) {
    return this.rideService.startRide(req['user']);
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Patch('endRide')
  async endRide(@Req() req: Request) {
    return this.rideService.endRide(req['user']);
  }

  @UseGuards(AuthGuard, RestrictTO('driver'))
  @UseInterceptors(AcceptRideInterceptor)
  @Patch('acceptRide/:rideId')
  async acceptRide(@Req() req: Request, @Body() price) {
    return this.rideService.acceptRide(
      req['ride'],
      req['driverInfo'],
      req['user'],
      price.price,
    );
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @Patch('refuseRide/:rideId')
  async refuseRide(@Req() req: Request, @Param('rideId') rideId) {
    return this.rideService.rejectRide(rideId, req['user']);
  }
  @UseGuards(AuthGuard, RestrictTO('driver'))
  @UseInterceptors(CaptainCancelRideInterceptor)
  @Patch('captainCancelRide/:rideId')
  async cancelRide(
    @Req() req: Request,
    @Param('rideId') rideId,
    @Body() cancelationBody: CancelationBodyDto,
  ) {
    return this.rideService.captainCancelRide(
      req['ride'],
      req['user'],
      cancelationBody.reasonOfCancelation,
    );
  }

  @UseGuards(AuthGuard, RestrictTO('user'))
  @Get('showAllAcceptedDrivers')
  async showAllAcceptedDrivers(@Body() rideRequestId: string) {
    return this.rideService.showAllAcceptedDrivers(rideRequestId);
  }

  @UseGuards(AuthGuard, RestrictTO('user'))
  @UseInterceptors(RequestRideInterceptor)
  @Post('requestRide')
  async requestRide(@Req() req: Request, @Body() data: RequestRideDto) {
    return this.rideService.requestRide(req['user'], req['drivers'], data);
  }
  @UseGuards(AuthGuard, RestrictTO('user'))
  @UseInterceptors(ClientConfirmationInterceptor)
  @Patch('clientConfirmation')
  async clientConfirmation(
    @Req() req: Request,
    @Body() confirmationData: ConfirmationTripDto,
  ) {
    return this.rideService.clientConfirmation(
      confirmationData.accept,
      req['captain'],
      req['user'],
      req['ride'],
    );
  }
  @UseGuards(AuthGuard, RestrictTO('user'))
  @Patch('clientCancelRide/:rideId')
  async clientCancelRide(
    @Param('rideId') rideId,
    @Body() cancelationBody: CancelationBodyDto,
  ) {
    return this.rideService.clientCancelRide(
      rideId,
      cancelationBody.reasonOfCancelation,
    );
  }
}
