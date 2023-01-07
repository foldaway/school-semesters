import moment, { Moment } from 'moment';

import { DATE_FORMAT } from '../constants';
import tzSingapore from './tzSingapore';

interface Event {
  summary: string;
  description: string;
  location: string;
  dtStart: Moment;
  dtEnd: Moment;
  tzid: string;
  repeatFreq?: 'weekly' | 'daily' | 'monthly';
  repeatEnd?: Moment;
  alarms: string[];
}

function escapeNewlines(str: string) {
  return str.replace(/\n/g, '\\n');
}

function capitalise(str: string) {
  const words = str.split(' ');

  return words
    .map((word) => {
      const initial = word[0].toUpperCase();
      const rest = word.slice(1);

      return `${initial}${rest}`;
    })
    .join(' ');
}

function generateEvent(event: Event) {
  const {
    summary,
    description,
    location,
    dtStart,
    dtEnd,
    repeatFreq,
    repeatEnd,
    alarms,
    tzid,
  } = event;

  let temp = `SUMMARY:${escapeNewlines(summary)}
DESCRIPTION:${escapeNewlines(description)}
LOCATION:${escapeNewlines(location)}
DTSTART;TZID=${tzid}:${dtStart.format('yyyyMMDD')}
DTEND;TZID=${tzid}:${dtEnd.format('yyyyMMDD')}`;

  if (repeatFreq && repeatEnd) {
    temp += '\n';
    temp += `RRULE:FREQ=${repeatFreq.toUpperCase()};UNTIL=${repeatEnd.format(
      'yyyyMMDDTHHmmss'
    )}`;
  }

  for (const alarm of alarms) {
    temp += '\n';
    temp += `BEGIN:VALARM
TRIGGER:${alarm}
ACTION:DISPLAY
DESCRIPTION:Alert before event
END:VALARM`;
  }

  return `BEGIN:VEVENT\n${temp}\nEND:VEVENT`;
}

function createEvent(
  uni: Omit<App.School, 'terms'>,
  term: App.Term,
  period: App.Period
): Event {
  const periodType = capitalise(period.type);
  let summary = `${term.label} (${periodType})`;

  if (period.week_no != null) {
    summary = `${term.label} Week ${period.week_no} (${periodType})`;
  }

  return {
    summary,
    description: uni.name,
    location: uni.name,
    tzid: 'Asia/Singapore',
    dtStart: moment(period.date_start, DATE_FORMAT, true),
    dtEnd: moment(period.date_end, DATE_FORMAT, true),
    alarms: ['PT-1D'],
  };
}

export default function generateICal(
  uni: Omit<App.School, 'terms'>,
  term: App.Term
): string {
  const events = term.periods.map((period) => {
    return createEvent(uni, term, period);
  });

  const eventStrings = events.map(generateEvent);

  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//calendarserver.org//Zonal//EN
${tzSingapore}
${eventStrings.join('\n')}
END:VCALENDAR`;
}
