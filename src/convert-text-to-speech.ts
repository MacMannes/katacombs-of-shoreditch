/* v8 ignore start */

import { YamlDataLoader } from './domain';
import { getAbsolutePath, RESOURCES_PATH, GAME_DATA } from './paths';
import path from 'node:path';
import { TextToSpeechConverter, TextToSpeechService } from '@utils/index';

const dataLoader = new YamlDataLoader();
const realm = await dataLoader.load(getAbsolutePath(path.join(RESOURCES_PATH, GAME_DATA)));
await new TextToSpeechConverter(new TextToSpeechService()).convert(realm.texts);

/* v8 ignore end */
