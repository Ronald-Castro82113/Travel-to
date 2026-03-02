import { Module } from '@nestjs/common';
import { ServiceModule } from './service/service.module';
import { ControllerModule } from './controller/controller.module';

@Module({
  imports: [ServiceModule, ControllerModule]
})
export class UsersModule {}
