import type { TestDefinition } from '../types';
import { coreOm } from './core-om';
import { air } from './air';
import { cans05, cans517 } from './cans';
import { vbmapp } from './vbmapp';
import { crm, icfAdat, qbs, wdms } from './stubs';
import { cesd, epds, gad7, gds15, phq15, phq9 } from './mood';
import { k10, pss10, rosenberg, swls, who5 } from './wellbeing';
import { pcl5, pcptsd5 } from './trauma';
import { aq10, asrs, snap4 } from './neuro';
import { ecrR, rq } from './attachment';
import { asq, audit, dast10, isi, ociR, pid5bf, psc35, scoff, whodas12 } from './misc';
import { ari, core10, crafft, flourishing, miniIpip, mspss, ors, panas, phq4, smfq, srs, ucla3, wsas } from './extra';
import { mmpi2 } from './mmpi2';

export const builtinTests: TestDefinition[] = [
  coreOm, air, cans05, cans517, vbmapp, qbs, crm, icfAdat, wdms,
  phq9, gad7, phq15, cesd, gds15, epds,
  who5, k10, swls, rosenberg, pss10,
  pcl5, pcptsd5,
  aq10, asrs, snap4,
  ecrR, rq,
  pid5bf, audit, dast10, isi, psc35, ociR, scoff, asq, whodas12,
  phq4, core10, wsas, mspss, ucla3, miniIpip, panas, flourishing, crafft, smfq, ari, ors, srs,
  mmpi2,
];
