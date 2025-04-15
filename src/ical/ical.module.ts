import { Module } from '@nestjs/common';
import { ICalService } from './ical.service';

@Module({
  providers: [ICalService],
  exports: [ICalService],
})
export class ICalModule {}
