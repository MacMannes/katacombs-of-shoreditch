import { YamlDataLoader } from '@katas/katacombs/domain';
import { getAbsolutePath, RESOURCES_PATH, GAME_DATA } from '@katas/katacombs/paths';
import path from 'node:path';
import { TextToSpeechConverter, TextToSpeechService } from '@katas/katacombs/utils';

const dataLoader = new YamlDataLoader();
const realm = await dataLoader.load(getAbsolutePath(path.join(RESOURCES_PATH, GAME_DATA)));
await new TextToSpeechConverter(new TextToSpeechService()).convert(realm.texts);
