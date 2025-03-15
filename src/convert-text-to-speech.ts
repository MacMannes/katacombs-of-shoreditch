/* v8 ignore start */

import { YamlDataLoader } from 'src/domain';
import { getAbsolutePath, RESOURCES_PATH, GAME_DATA } from 'src/paths';
import path from 'node:path';
import { TextToSpeechConverter, TextToSpeechService } from 'src/utils';

const dataLoader = new YamlDataLoader();
const realm = await dataLoader.load(
    getAbsolutePath(path.join(RESOURCES_PATH, GAME_DATA)),
);
await new TextToSpeechConverter(new TextToSpeechService()).convert(realm.texts);

/* v8 ignore end */
