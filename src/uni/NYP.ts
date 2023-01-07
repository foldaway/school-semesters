import moment, { Moment } from 'moment';

import { DATE_FORMAT, YEARS_TO_GENERATE } from '../constants';
import { Day, nthDayOfMonth } from '../util';

interface TermInfo {
  instructionWeekCount1: number;
  breakWeekCount: number;
  instructionWeekCount2: number;
  examWeekCount: number;
  vacationWeekCount: number;
}

function getTermInfo(termNum: number): TermInfo {
  switch (termNum) {
    case 1: {
      return {
        instructionWeekCount1: 8,
        breakWeekCount: 2,
        instructionWeekCount2: 7,
        examWeekCount: 3,
        vacationWeekCount: 6,
      };
    }
    default: {
      return {
        instructionWeekCount1: 9,
        breakWeekCount: 2,
        instructionWeekCount2: 6,
        examWeekCount: 3,
        vacationWeekCount: 3,
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

  // Instruction
  let weekNo = 1;
  for (let index = 0; index < termInfo.instructionWeekCount1; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateTeachingWeek(tempStart, tempEnd, weekNo));

    weekNo++;
  }

  // Break
  for (let index = 0; index < termInfo.breakWeekCount; index++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');

    periods.push(generateWeek(tempStart, tempEnd, weekNo, 'vacation'));

    weekNo++;
  }

  // Instruction
  for (let index = 0; index < termInfo.instructionWeekCount2; index++) {
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

  // Vacation
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

export default function NYP() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  for (let yearIndex = -1; yearIndex < YEARS_TO_GENERATE; yearIndex++) {
    const aprilMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 3)
      .set('date', 1);

    let start = nthDayOfMonth(aprilMoment, Day.Mon, 3);

    const yearName = `AY${start.format('YYYY')}/${start
      .clone()
      .add(1, 'year')
      .format('YYYY')}`;

    for (let termIndex = 0; termIndex < 2; termIndex++) {
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
    name: 'Nanyang Polytechnic',
    terms,
  };

  return school;
}
