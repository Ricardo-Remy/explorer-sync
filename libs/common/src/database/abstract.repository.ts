import { Logger } from '@nestjs/common';
import { FilterQuery, Model, Types, SaveOptions, Connection } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { PaginationQueryDto } from './pagination-query.dto';

// Flexible AbstractRepository
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(document: any, options?: SaveOptions): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit } = paginationQuery;
    return this.model.find().limit(limit).exec();
  }

  async find(filterQuery: FilterQuery<TDocument>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async delete() {
    return this.model.remove();
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>) {
    return this.model.deleteMany(filterQuery);
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
