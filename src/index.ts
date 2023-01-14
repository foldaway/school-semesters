import fs from 'fs';
import moment from 'moment';
import * as os from 'os';
import path from 'path';
import pug from 'pug';

import generateICal from './calendar/generateICal';
import DigiPen from './uni/DigiPen';
import NP from './uni/NP';
import NTU from './uni/NTU';
import NUS from './uni/NUS';
import NYP from './uni/NYP';
import SMU from './uni/SMU';
import SP from './uni/SP';
import SUSS from './uni/SUSS';
import SUTD from './uni/SUTD';
import TP from './uni/TP';
import TPDesign from './uni/TPDesign';

interface File {
  name: string;
}

async function run() {
  const output: Record<string, App.School> = {
    SMU: SMU(),
    NUS: NUS(),
    DigiPen: DigiPen(),
    NTU: NTU(),
    SUTD: SUTD(),
    SUSS: SUSS(),
    NP: NP(),
    SP: SP(),
    NYP: NYP(),
    TP: TP(),
    TPDesign: TPDesign(),
  };

  // Ensure output directory exists
  try {
    fs.mkdirSync('output');
  } catch (e) {}

  const jsonFiles: File[] = [];
  const icsFiles: File[] = [];

  for (const [filename, data] of Object.entries(output)) {
    fs.writeFileSync(`output/${filename}.json`, JSON.stringify(data, null, 2));

    jsonFiles.push({
      name: `${filename}.json`,
    });
  }

  for (const [filename, uni] of Object.entries(output)) {
    // Create sub-directory
    if (!fs.existsSync(`output/${filename}`)) {
      fs.mkdirSync(`output/${filename}`);
    }

    for (const term of uni.terms) {
      const calendarData = generateICal(uni, term);
      const termFileName = term.label.replace(/\//g, '-');

      fs.writeFileSync(`output/${filename}/${termFileName}.ics`, calendarData);

      icsFiles.push({
        name: `${filename}/${termFileName}.ics`,
      });
    }
  }

  const now = moment();

  const generatedTime = {
    isoString: now.toISOString(true),
    displayText: now.format('lll ZZ'),
  };

  const osInfo = {
    platform: os.platform(),
    arch: os.arch(),
  };

  const indexPage = pug.renderFile(
    path.join(__dirname, 'templates/index.pug'),
    {
      jsonFiles,
      icsFiles,
      generatedTime,
      osInfo,
    }
  );

  fs.writeFileSync('output/index.html', indexPage);
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
