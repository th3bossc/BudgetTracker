export const DATE_PICKER_TRANSLATIONS = {
    'en': {
        save: 'Save',
        selectSingle: 'Select date',
        selectMultiple: 'Select dates',
        selectRange: 'Select range',
        notAccordingToDateFormat: (inputFormat: any) =>
            `Date format must be ${inputFormat}`,
        mustBeHigherThan: (date: any) => `Must be after ${date}`,
        mustBeLowerThan: (date: any) => `Must be before ${date}`,
        mustBeBetween: (startDate: any, endDate: any) =>
            `Must be between ${startDate} - ${endDate}`,
        dateIsDisabled: 'Date is not allowed',
        previous: 'Previous',
        next: 'Next',
        typeInDate: 'Type in date',
        pickDateFromCalendar: 'Pick date from calendar',
        close: 'Close',
        hour: 'Hour',
        minute: 'Minute'
    }
}
