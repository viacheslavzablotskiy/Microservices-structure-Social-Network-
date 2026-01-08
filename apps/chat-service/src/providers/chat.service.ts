import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';

@Injectable()
export class AppService{

  constructor(@InjectConnection() private connection: Connection) {}
}
