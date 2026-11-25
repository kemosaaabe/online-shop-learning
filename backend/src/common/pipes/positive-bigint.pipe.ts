import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { maxPostgresBigint } from '../constants/index.js';

@Injectable()
export class PositiveBigintPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[0-9]+$/.test(value)) {
      throw new BadRequestException('Некорректный ID');
    }

    const id = BigInt(value);

    if (id < 1n || id > maxPostgresBigint) {
      throw new BadRequestException('ID вне допустимого диапазона');
    }

    return value;
  }
}
