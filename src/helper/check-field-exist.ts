import { ObjectLiteral, Repository } from 'typeorm';
import { sanitizeString } from './utils';

export async function checkFieldExists<T extends ObjectLiteral>(
  repo: Repository<T>,
  column: string,
  value: string | string[],
  conditions: Partial<Record<keyof T, string | number | boolean>> = {}
): Promise<boolean> {
  const alias = repo.metadata.tableName;
  const values = Array.isArray(value)
    ? value.map(sanitizeString)
    : [sanitizeString(value)];

  let query = repo
    .createQueryBuilder(alias)
    .where(
      `REPLACE(LOWER(${alias}.${column}), ' ', '') IN (:...normalizedValues)`,
      { normalizedValues: values }
    );

  for (const [key, val] of Object.entries(conditions)) {
    query = query.andWhere(`${alias}.${key} = :${key}`, { [key]: val });
  }

  return query.getExists();
}
