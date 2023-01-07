declare namespace App {
  type PeriodType = 'class' | 'recess' | 'exam' | 'reading' | 'vacation';

  interface Period {
    date_start: string;
    date_end: string;
    type: PeriodType;
    week_no?: number;
  }

  // Used to represent a term or semester
  interface Term {
    label: string;
    periods: Period[];
  }

  interface School {
    name: string;
    terms: Term[];
  }
}
