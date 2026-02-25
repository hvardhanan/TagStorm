import { BaseMap } from "./base-map";
import { maps } from "../../../common/common";

const config = maps.find(m => m.sceneKey === 'DungeonMap');

export class DungeonMap extends BaseMap {
    static SCENE_KEY = 'DungeonMap';
    constructor() { super(config); }
}
