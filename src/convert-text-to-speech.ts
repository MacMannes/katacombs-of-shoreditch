/* v8 ignore start */

import { getAbsolutePath, RESOURCES_PATH, GAME_DATA } from 'src/paths.ts';
import path from 'node:path';
import { TextToSpeechConverter } from 'src/utils/text-to-speech-converter.ts';
import { TextToSpeechService } from 'src/utils/text-to-speech-service.ts';
import { YamlDataLoader } from 'src/domain/data-loader/yaml-data-loader.ts';

const dataLoader = new YamlDataLoader();
const realm = await dataLoader.load(
    getAbsolutePath(path.join(RESOURCES_PATH, GAME_DATA)),
);
await new TextToSpeechConverter(new TextToSpeechService()).convert(realm.texts);

/* v8 ignore end */
