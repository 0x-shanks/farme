import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

export const getMintDuration = (value: number) => {
  const now = new Date();
  switch (value) {
    case 0:
      return {
        label: '1 day',
        date: addDays(now, 1)
      };
    case 1:
      return {
        label: '3 days',
        date: addDays(now, 3)
      };
    case 2:
      return {
        label: '1 week',
        date: addWeeks(now, 1)
      };
    case 3:
      return {
        label: '2 week',
        date: addWeeks(now, 2)
      };
    case 4:
      return {
        label: '1 month',
        date: addMonths(now, 1)
      };
    case 5:
      return {
        label: '3 months',
        date: addMonths(now, 3)
      };
    case 6:
      return {
        label: '6 months',
        date: addMonths(now, 6)
      };
    case 7:
      return {
        label: '1 years',
        date: addYears(now, 1)
      };
    case 8:
      return {
        label: '3 years',
        date: addYears(now, 3)
      };
    case 9:
      return {
        label: 'Open',
        date: addYears(now, 1000)
      };
    default: {
      return {
        label: '3 months',
        date: addMonths(now, 3)
      };
    }
  }
};
