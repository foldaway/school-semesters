import moment, { Moment } from 'moment';

import {
  DATE_FORMAT,
  SMU_ACADEMIC_PERIOD_WEEKS,
  YEARS_TO_GENERATE,
} from '../constants';
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

function generateInstrWeek(
  start: Moment,
  end: Moment,
  weekNo: number
): App.Period {
  return generateWeek(start, end, weekNo, 'class');
}

function generateExamWeek(
  start: Moment,
  end: Moment,
  weekNo: number
): App.Period {
  return generateWeek(start, end, weekNo, 'exam');
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
  for (weekNo; weekNo < 8; weekNo++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateInstrWeek(tempStart, tempEnd, weekNo));
  }

  // Recess
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(1, 'week');

  const periodRecess: App.Period = {
    date_start: tempStart.format(DATE_FORMAT),
    date_end: tempEnd.clone().format(DATE_FORMAT),
    type: 'recess',
    week_no: weekNo,
  };

  periods.push(periodRecess);
  weekNo += 1;

  // Term post-recess
  for (weekNo; weekNo < 15; weekNo++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateInstrWeek(tempStart, tempEnd, weekNo));
  }

  // Exam
  for (weekNo; weekNo < 17; weekNo++) {
    tempStart = tempStart.clone().add(1, 'week');
    tempEnd = tempEnd.clone().add(1, 'week');
    periods.push(generateExamWeek(tempStart, tempEnd, weekNo));
  }

  // Vacation
  tempStart = tempEnd.clone();
  tempEnd = tempEnd.clone().add(vacationWeekCount, 'week');

  const periodVacation: App.Period = {
    date_start: tempStart.format(DATE_FORMAT),
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

function getAcademicCalendarYearStartDate(monthMoment: Moment) {
  let start = nthDayOfMonth(monthMoment, Day.Mon, 3);
  const dayOfMonth = Number(start.format('D'));

  /**
   * ASSUMPTION: SMU academic year generally start on the 3rd Monday of August
   * If the day of month > 20, it will fall on the 2nd Monday instead
   */
  if (dayOfMonth > 20) {
    start = nthDayOfMonth(monthMoment, Day.Mon, 2);
  }

  return start;
}

export default function SMU() {
  const terms: App.Term[] = [];

  const currentYear = moment().year();

  // Generate for the next X years
  for (let yearIndex = -1; yearIndex < YEARS_TO_GENERATE; yearIndex++) {
    const augustMoment = moment()
      .set('year', currentYear + yearIndex)
      .set('month', 7)
      .set('date', 1);

    let start = getAcademicCalendarYearStartDate(augustMoment);

    const upcomingAugustMoment = augustMoment.clone().add(1, 'year');
    const upcomingAcademicStart =
      getAcademicCalendarYearStartDate(upcomingAugustMoment);

    const yearName = `AY${start.format('YYYY')}-${start
      .clone()
      .add(1, 'year')
      .format('YY')}`;

    // Terms
    for (let termIndex = 0; termIndex < 2; termIndex++) {
      let vacationWeekCount = SMU_ACADEMIC_PERIOD_WEEKS.VACATION_1 - 1;

      // Consider Term 2 Vacations cases with more than 16 weeks of break
      // Calculate by comparing start date of next academic year
      if (termIndex + 1 === 2) {
        const numOfWeeksTerm2 = upcomingAcademicStart.diff(start, 'weeks');
        vacationWeekCount =
          numOfWeeksTerm2 - SMU_ACADEMIC_PERIOD_WEEKS.STUDY - 1;
      }

      const { term, end } = generateTerm(
        start,
        `Term ${termIndex + 1} ${yearName}`,
        vacationWeekCount
      );

      terms.push(term);
      start = end.clone();
    }
  }

  const uni: App.School = {
    name: 'Singapore Management University',
    terms,
  };

  return uni;
}
