import moment, { Moment } from 'moment';

import { DATE_FORMAT, YEARS_TO_GENERATE } from '../constants';
import { Day, nthDayOfMonth } from '../util';

interface TermInfo {
  teachingWeekCount: number;
  vacationWeekCount: number;
  examWeekCount: number;
}

function getTermInfo(termNum: number): TermInfo {
  switch (termNum) {
    case 1: {
      return {
        teachingWeekCount: 7,
        vacationWeekCount: 3,
        examWeekCount: 0,
      };
    }
    case 2: {
      return {
        teachingWeekCount: 8,
        vacationWeekCount: 6,
        examWeekCount: 2,
      };
    }
    case 3: {
      return {
        teachingWeekCount: 8,
        vacationWeekCount: 3,
        examWeekCount: 0,
      };
    }
    default: {
      return {
        teachingWeekCount: 7,
        vacationWeekCount: 6,
        examWeekCount: 2,
      };
    }
  }
}

function generateWeek(
  start: Moment,
  end: Moment,
  weekNo: number,
  type: App.PeriodType
): App.Period {
  return {
    date_start: start.format(DATE_FORMAT),
    date_end: end.clone().format(DATE_FORMAT),
    type: type,
    week_no: weekNo,
  };
}

function generateTeachingWeek(
  start: Moment,
  end: Moment,
  weekNo: number
): App.Period {
  return generateWeek(start, end, weekNo, 'class');
}

function generateTerm(start: Moment, label: string, termInfo: TermInfo) {
  if (start.weekday() !== 1) {
    throw new Error('Start date given does not fall on a Monday.');
  }

  const periods: App.Period[] = [];

  let tempStart = start.clone().subtract(1, 'week');
  let tempEnd = start.clone();

  // Teaching Weeks (Term 1)
  let weekNo = 1;
  for (let index = 0; index < termInfo.teachingWeekCount; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateTeachingWeek(tempStart, tempEnd, weekNo));

    weekNo++;
  }

  // Exam
  for (let index = 0; index < termInfo.examWeekCount; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');

    periods.push(generateWeek(tempStart, tempEnd, weekNo, 'exam'));

    weekNo++;
  }

  // Break
  for (let index = 0; index < termInfo.vacationWeekCount; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');

    periods.push(generateWeek(tempStart, tempEnd, weekNo, 'vacation'));

    weekNo++;
  }

  const term: App.Term = {
    label,
    periods,
  };

  return { term, end: tempEnd };
}

export default function SP() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  for (let yearIndex = -1; yearIndex < YEARS_TO_GENERATE; yearIndex++) {
    const aprilMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 3)
      .set('date', 1);

    let start = nthDayOfMonth(aprilMoment, Day.Mon, 3);

    const yearName = `AY${start.format('YYYY')}-${start
      .clone()
      .add(1, 'year')
      .format('YY')}`;

    for (let termIndex = 0; termIndex < 4; termIndex++) {
      const termInfo = getTermInfo(termIndex + 1);

      const { term, end } = generateTerm(
        start,
        `${yearName} Term ${termIndex + 1}`,
        termInfo
      );

      terms.push(term);
      start = end.clone();
    }
  }

  const school: App.School = {
    name: 'Singapore Polytechnic',
    terms,
  };

  return school;
}
