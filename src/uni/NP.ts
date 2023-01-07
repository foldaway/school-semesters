import moment, { Moment } from 'moment';

import { DATE_FORMAT, YEARS_TO_GENERATE } from '../constants';
import { Day, nthDayOfMonth } from '../util';

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

function generateTerm(start: Moment, label: string) {
  if (start.weekday() !== 1) {
    throw new Error('Start date given does not fall on a Monday.');
  }

  const periods: App.Period[] = [];

  let tempStart = start.clone().subtract(1, 'week');
  let tempEnd = start.clone();

  // Teaching Weeks
  let weekNo = 1;
  for (let index = 0; index < 8; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateTeachingWeek(tempStart, tempEnd, weekNo + index));

    weekNo = weekNo + index;
  }

  // Break
  for (let index = 0; index < 2; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');

    periods.push(generateWeek(tempStart, tempEnd, weekNo + index, 'vacation'));

    weekNo = weekNo + index;
  }

  // Teaching Weeks
  for (let index = 0; index < 7; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateTeachingWeek(tempStart, tempEnd, weekNo + index));

    weekNo = weekNo + index;
  }

  // Exam Weeks
  for (let index = 0; index < 2; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateWeek(tempStart, tempEnd, weekNo + index, 'exam'));

    weekNo = weekNo + index;
  }

  // Break
  for (let index = 0; index < 7; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');

    periods.push(generateWeek(tempStart, tempEnd, weekNo + index, 'vacation'));

    weekNo = weekNo + index;
  }

  const term: App.Term = {
    label,
    periods,
  };

  return { term, end: tempEnd };
}

export default function NP() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  for (let yearIndex = -1; yearIndex < YEARS_TO_GENERATE; yearIndex++) {
    const aprilMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 3)
      .set('date', 1);

    let start = nthDayOfMonth(aprilMoment, Day.Mon, 3);

    for (let termIndex = 0; termIndex < 2; termIndex++) {
      const { term, end } = generateTerm(
        start,
        `${start.format('MMMM YYYY')} Semester ${termIndex + 1}`
      );

      terms.push(term);
      start = end.clone();
    }
  }

  const school: App.School = {
    name: 'Ngee Ann Polytechnic',
    terms,
  };

  return school;
}
