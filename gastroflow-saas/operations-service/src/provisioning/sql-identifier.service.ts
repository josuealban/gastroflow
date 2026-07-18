import { Injectable } from '@nestjs/common';
@Injectable()
export class SqlIdentifierService {
  validate(value: string): string {
    if (!/^[a-z][a-z0-9_]{1,62}$/.test(value))
      throw new Error('Unsafe PostgreSQL identifier');
    return value;
  }
  quote(value: string): string {
    return `"${this.validate(value)}"`;
  }
  literal(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }
}
