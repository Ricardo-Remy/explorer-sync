import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Explorer } from './schemas/explorer.schema';

@Injectable()
export class ExplorerRepository extends AbstractRepository<Explorer> {
  protected readonly logger = new Logger(ExplorerRepository.name);

  constructor(
    @InjectModel(Explorer.name) blockModel: Model<Explorer>,
    @InjectConnection() connection: Connection,
  ) {
    super(blockModel, connection);
  }
}
