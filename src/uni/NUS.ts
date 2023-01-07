import moment, { Moment } from 'moment';

import { DATE_FORMAT, YEARS_TO_GENERATE } from '../constants';
import { Day, nthDayOfMonth } from '../util';

function generateInstrWeek(
  start: Moment,
  end: Moment,
  weekNo: number
): App.Period {
  return {
    date_start: start.format(DATE_FORMAT),
    date_end: end.clone().subtract(2, 'days').format(DATE_FORMAT),
    type: 'class',
    week_no: weekNo,
  };
}

function generateTerm(start: Moment, label: string, vacationWeekCount: number) {
  if (start.weekday() !== 1) {
    throw new Error('Start date given does not fall on a Monday.');
  }

  // Initialize the looping process from a week ago so that each individual sections can start from the correct starting date
  // Outer scope tempStart and tempEnd should both start on Mondays and they should be a week apart.
  let tempStart = start.clone().subtract(1, 'week');
  let tempEnd = start.clone();

  const periods: App.Period[] = [];
  let weekNo = 1;

  // Term pre-recess
  for (weekNo; weekNo < 7; weekNo++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateInstrWeek(tempStart, tempEnd, weekNo));
  }

  // Recess
  // Recess week is from prev Sat to Sun
  // e.g. Sat, 18 Sep 2021 to Sun, 26 Sep 2021
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(1, 'week');

  const periodRecess: App.Period = {
    date_start: tempStart.clone().subtract(2, 'days').format(DATE_FORMAT),
    date_end: tempEnd.clone().format(DATE_FORMAT),
    type: 'recess',
  };

  periods.push(periodRecess);

  // Term post-recess
  for (weekNo; weekNo < 14; weekNo++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateInstrWeek(tempStart, tempEnd, weekNo));
  }

  // Reading
  // Reading week is from prev Sat to Fri
  // e.g. Sat, 13 Nov 2021 to Fri, 19 Nov 2021
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(1, 'week');

  const periodReading: App.Period = {
    date_start: tempStart.clone().subtract(2, 'days').format(DATE_FORMAT),
    date_end: tempEnd.clone().subtract(2, 'days').format(DATE_FORMAT),
    type: 'reading',
  };

  periods.push(periodReading);

  // Exam
  // Exam week is from prev Sat to the Sat 2 weeks after.
  // e.g. Sat, 20 Nov 2021 to Sat, 4 Dec 2021
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(2, 'week');

  const periodExam: App.Period = {
    date_start: tempStart.clone().subtract(2, 'days').format(DATE_FORMAT),
    date_end: tempEnd.clone().subtract(1, 'days').format(DATE_FORMAT),
    type: 'exam',
  };

  periods.push(periodExam);

  // Vacation
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(vacationWeekCount, 'week');

  const periodVacation: App.Period = {
    date_start: tempStart.clone().subtract(1, 'days').format(DATE_FORMAT),
    date_end: tempEnd.clone().format(DATE_FORMAT),
    type: 'vacation',
  };

  periods.push(periodVacation);

  const term: App.Term = {
    label,
    periods,
  };

  return { term, end: tempEnd };
}

export default function NUS() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  // Generate for the next X years
  for (let yearIndex = -1; yearIndex < YEARS_TO_GENERATE; yearIndex++) {
    const augustMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 7)
      .set('date', 1);

    let start = nthDayOfMonth(augustMoment, Day.Mon, 2);

    const yearName = `AY${start.format('YYYY')}/${start
      .clone()
      .add(1, 'year')
      .format('YYYY')}`;

    // Terms
    for (let termIndex = 0; termIndex < 2; termIndex++) {
      const vacationWeekCount = termIndex === 0 ? 5 : 12;

      const { term, end } = generateTerm(
        start,
        `Semester ${termIndex + 1} ${yearName}`,
        vacationWeekCount
      );

      terms.push(term);
      start = end.clone();
    }
  }

  const uni: App.Uni = {
    name: 'National University of Singapore',
    terms,
  };

  return uni;
}
