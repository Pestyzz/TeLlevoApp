import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function plateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const validPlatePattern = /^[A-Z]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;

        const valid = validPlatePattern.test(control.value);
        return valid ? null : { invalidPlate: true };
    }
}