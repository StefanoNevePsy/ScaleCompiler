import type { TestDefinition } from '../types';
import { coreOm } from './core-om';
import { air } from './air';
import { cans05, cans517 } from './cans';
import { vbmapp } from './vbmapp';
import { crm, icfAdat, qbs, wdms } from './stubs';

export const builtinTests: TestDefinition[] = [coreOm, air, cans05, cans517, vbmapp, qbs, crm, icfAdat, wdms];
