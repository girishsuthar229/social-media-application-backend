import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions
} from 'class-validator';

type Comparator = 'match' | 'not-match';

export function CompareWith(
  relatedProperty: string,
  comparator: Comparator = 'match',
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'CompareWith',
      target: object.constructor,
      propertyName,
      constraints: [relatedProperty, comparator],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, comparatorType] = args.constraints as [
            string,
            Comparator
          ];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          return comparatorType === 'match'
            ? value === relatedValue
            : value !== relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, comparatorType] = args.constraints as [
            string,
            Comparator
          ];
          const verb = comparatorType === 'match' ? 'match' : 'not match';
          return `${args.property} must ${verb} ${relatedPropertyName}`;
        }
      }
    });
  };
}
