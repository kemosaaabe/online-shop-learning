import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseIntPipe,
} from '@nestjs/common';

@Injectable()
export class PositiveIntPipe extends ParseIntPipe {
  override async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<number> {
    const parsedValue = await super.transform(value, metadata);

    if (!parsedValue || parsedValue < 0 || !Number.isSafeInteger(parsedValue)) {
      throw new BadRequestException();
    }

    return parsedValue;
  }
}
