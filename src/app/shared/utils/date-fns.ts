import {
  endOfQuarter,
  endOfYear,
  startOfQuarter,
  startOfYear,
  subQuarters,
  subYears
} from 'date-fns';

export type DateRange = { start: Date; end: Date };

/**
 * getDateRange
 *
 * A utility function to compute predefined date ranges based on the given option.
 * Commonly used in dashboards, reports, or analytics modules to filter data by quarter, half, or year.
 *
 * @param option A string indicating the desired date range
 * @returns An object containing `start` and `end` Date objects for the selected range
 *
 * @throws Error if the option is not recognized
 */
export function getDateRange(option: string): DateRange {
  const today = new Date();

  switch (option) {
    case 'This Quarter': {
      return {
        start: startOfQuarter(today),
        end: today
      };
    }

    case 'Last Quarter': {
      const lastQuarter = subQuarters(today, 1);
      return {
        start: startOfQuarter(lastQuarter),
        end: endOfQuarter(lastQuarter)
      };
    }

    case 'This Half': {
      const yearStart = startOfYear(today);
      const halfStart = today.getMonth() < 6 ? yearStart : new Date(today.getFullYear(), 6, 1);
      return { start: halfStart, end: today };
    }

    case 'Last Half': {
      if (today.getMonth() < 6) {
        // We're in Jan–Jun, so last half is Jul–Dec of previous year
        return {
          start: new Date(today.getFullYear() - 1, 6, 1),
          end: new Date(today.getFullYear() - 1, 11, 31)
        };
      } else {
        // We're in Jul–Dec, so last half is Jan–Jun of this year
        return {
          start: new Date(today.getFullYear(), 0, 1),
          end: new Date(today.getFullYear(), 5, 30)
        };
      }
    }

    case 'This Year': {
      return {
        start: startOfYear(today),
        end: today
      };
    }

    case 'Last Year': {
      const lastYear = subYears(today, 1);
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear)
      };
    }

    case 'Custom': {
      // Should be handled via form
      return { start: today, end: today };
    }

    default:
      throw new Error('Unknown range option');
  }
}
