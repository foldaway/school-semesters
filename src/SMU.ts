import moment, { Moment } from 'moment';

import { Day, nthDayOfMonth } from './util';

function generateTerm(start: Moment, label: string, vacationWeekCount: number) {
  const periods: App.Period[] = [];

  let tempStart = start.clone();
  let tempEnd = start.clone();

  // Term pre-recess
  for (let weekIndex = 0; weekIndex < 7; weekIndex++) {
    tempEnd = tempEnd.clone().add(1, 'week');
  }

  const periodClass1: App.Period = {
    date_start: tempStart.toISOString(),
    date_end: tempEnd.clone().subtract(1, 'day').toISOString(),
    type: 'class',
  };

  periods.push(periodClass1);

  // Recess
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(1, 'week');

  const periodRecess: App.Period = {
    date_start: tempStart.toISOString(),
    date_end: tempEnd.clone().subtract(1, 'day').toISOString(),
    type: 'recess',
  };

  periods.push(periodRecess);

  // Term post-recess
  tempStart = tempEnd.clone();

  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    tempEnd = tempEnd.clone().add(1, 'week');
  }

  const periodClass2: App.Period = {
    date_start: tempStart.toISOString(),
    date_end: tempEnd.clone().subtract(1, 'day').toISOString(),
    type: 'class',
  };

  periods.push(periodClass2);

  // Exam
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(2, 'week');

  const periodExam: App.Period = {
    date_start: tempStart.toISOString(),
    date_end: tempEnd.clone().subtract(1, 'day').toISOString(),
    type: 'exam',
  };

  periods.push(periodExam);

  // Vacation
  tempStart = tempEnd.clone();

  for (let weekIndex = 0; weekIndex < vacationWeekCount - 1; weekIndex++) {
    tempEnd = tempEnd.clone().add(1, 'week');
  }

  const periodVacation: App.Period = {
    date_start: tempStart.toISOString(),
    date_end: tempEnd.clone().subtract(1, 'day').toISOString(),
    type: 'vacation',
  };

  periods.push(periodVacation);

  const term: App.Term = {
    label,
    periods,
  };

  return { term, end: tempEnd };
}

export default function SMU() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  // Generate for the next four years
  for (let yearIndex = -1; yearIndex < 4; yearIndex++) {
    const augustMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 7)
      .set('date', 1);

    let start = nthDayOfMonth(augustMoment, Day.Mon, 3);

    const yearName = `AY${start.format('YYYY')}-${start
      .clone()
      .add(1, 'year')
      .format('YY')}`;

    // Terms
    for (let termIndex = 0; termIndex < 2; termIndex++) {
      const vacationWeekCount = termIndex === 0 ? 6 : 16;

      const { term, end } = generateTerm(
        start,
        `Term ${termIndex + 1} ${yearName}`,
        vacationWeekCount
      );

      terms.push(term);
      start = end.clone();
    }
  }

  const uni: App.Uni = {
    name: 'Singapore Management University',
    terms,
  };

  return uni;
}
