import { Injectable, Logger, Query } from '@nestjs/common';
import { ExplorerRepository } from './explorer.repository';
import { InsertBlockConstants, PaginationQueryDto } from '@app/common';

import { ExplorerInsertBlockDto } from './dto/explorer-insert-block.event';

@Injectable()
export class ExplorerService {
  private readonly logger = new Logger(ExplorerService.name);

  constructor(private readonly explorerRepository: ExplorerRepository) {}

  // Get latest fetched blocks
  async getBlocks(@Query() paginationQuery: PaginationQueryDto) {
    const repo = await this.explorerRepository.findAll(paginationQuery);
    this.logger.log(
      'Request got Cached - next possible request result in 60seconds...',
    );
    return repo.sort((a, b) => b.blockHeight - a.blockHeight);
  }

  // Async function for development purpose
  async deleteAllBlock() {
    return this.explorerRepository.delete();
  }

  // For demo purpose we limit the number of documents to 100
  // Once 100 is reached we delete the oldest 20 documents
  // Then we insert the data received from the message broker
  async insertBlock(block: ExplorerInsertBlockDto) {
    const document = await this.explorerRepository.find({});
    const deleteBatch = document
      .slice(0, InsertBlockConstants.BATCH_LIMIT_COUNT)
      .map((el) => el._id);

    this.logger.log(
      `Checking DB documents lenght before inserting - BlockNumber - ${document.length}`,
    );

    // Check length of document
    if (document.length > InsertBlockConstants.DOCUMENT_LIMIT_COUNT) {
      // Delete batch
      await this.explorerRepository.deleteMany({
        _id: {
          $in: deleteBatch,
        },
      });
      this.logger.debug(`Successfully deleted block batch ${deleteBatch}`);
    }

    this.logger.log('Insert Data', block);
    // Start transaction
    const session = await this.explorerRepository.startTransaction();

    try {
      // Insert blocks
      const insertion = await this.explorerRepository.create(block);

      if (insertion) {
        // If successfull insertion, commit tr
        await session.commitTransaction();
      }

      return insertion;
    } catch (error) {
      // If error abortTransaction
      await session.abortTransaction();
      this.logger.error('Error in inserting block', error);
    }
  }
}
