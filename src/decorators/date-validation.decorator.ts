import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isToDateMustBeFiveYearsOld', async: false })
export class IsToDateMustBeFiveYearsOld
  implements ValidatorConstraintInterface
{
  validate(birthDateStr: string) {
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    if (!birthDateStr) return true;
    const birthDate = new Date(birthDateStr);
    const today = new Date();

    // Calculate the date 5 years ago
    const fiveYearsAgo = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate(),
    );

    return new Date(birthDate) <= new Date(fiveYearsAgo);
  }
}

@ValidatorConstraint({ name: 'isDateNotInFuture', async: false })
export class IsDateNotInFuture implements ValidatorConstraintInterface {
  validate(date: string) {
    if (!date) return true;
    return new Date(date) <= new Date();
  }
}
