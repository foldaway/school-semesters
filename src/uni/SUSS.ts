import moment, { Moment } from 'moment';

import { Day, nthDayOfMonth } from '../util';

function generateTerm(
  start: Moment,
  label: string,
  examRevisionWeekCount: number,
  vacationWeekCount: number
) {
  const periods: App.Period[] = [];

  let tempStart = start.clone();
  let tempEnd = start.clone();

  // Term pre-recess
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    tempEnd = tempEnd.clone().add(1, 'week');
  }

  const periodClass1: App.Period = {
    date_start: tempStart.toISOString(true),
    date_end: tempEnd.clone().toISOString(true),
    type: 'class',
  };

  periods.push(periodClass1);

  // Recess
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(2, 'week');

  const periodRecess1: App.Period = {
    date_start: tempStart.toISOString(true),
    date_end: tempEnd.clone().toISOString(true),
    type: 'recess',
  };

  periods.push(periodRecess1);

  // Term post-recess
  tempStart = tempEnd.clone();

  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    tempEnd = tempEnd.clone().add(1, 'week');
  }

  const periodClass2: App.Period = {
    date_start: tempStart.toISOString(true),
    date_end: tempEnd.clone().toISOString(true),
    type: 'class',
  };

  periods.push(periodClass2);

  // Recess (pre-exam revision)
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(examRevisionWeekCount, 'week');

  const periodRecess2: App.Period = {
    date_start: tempStart.toISOString(true),
    date_end: tempEnd.clone().toISOString(true),
    type: 'recess',
  };

  periods.push(periodRecess2);

  // Exam
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(2, 'week');

  const periodExam: App.Period = {
    date_start: tempStart.toISOString(true),
    date_end: tempEnd.clone().toISOString(true),
    type: 'exam',
  };

  periods.push(periodExam);

  // Vacation
  tempStart = tempEnd.clone();

  for (let weekIndex = 0; weekIndex < vacationWeekCount - 1; weekIndex++) {
    tempEnd = tempEnd.clone().add(1, 'week');
  }

  const periodVacation: App.Period = {
    date_start: tempStart.toISOString(true),
    date_end: tempEnd.clone().toISOString(true),
    type: 'vacation',
  };

  periods.push(periodVacation);

  const term: App.Term = {
    label,
    periods,
  };

  return { term, end: tempEnd };
}

function getExamRevisionWeekCount(termNum: number) {
  switch (termNum) {
    case 1: {
      return 2;
    }
    default: {
      return 1;
    }
  }
}

function getVacationWeekCount(termNum: number) {
  switch (termNum) {
    case 1: {
      return 10;
    }
    default: {
      return 9;
    }
  }
}

export default function SUSS() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  // Generate for the next four years
  for (let yearIndex = -1; yearIndex < 4; yearIndex++) {
    const januaryMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 0)
      .set('date', 1);

    let start = nthDayOfMonth(januaryMoment, Day.Mon, 4);

    const yearName = start.format('YYYY');

    // Terms
    for (let termIndex = 0; termIndex < 2; termIndex++) {
      const examRevisionWeekCount = getExamRevisionWeekCount(termIndex + 1);
      const vacationWeekCount = getVacationWeekCount(termIndex + 1);

      const { term, end } = generateTerm(
        start,
        `${start.format('MMMM')} Semester ${yearName}`,
        examRevisionWeekCount,
        vacationWeekCount
      );

      terms.push(term);
      start = end.clone();
    }
  }

  const uni: App.Uni = {
    name: 'Singapore University of Social Sciences',
    terms,
  };

  return uni;
}
