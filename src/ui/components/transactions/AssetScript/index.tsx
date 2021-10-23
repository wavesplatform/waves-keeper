import { AssetScript } from './AssetScript';
import { AssetScriptCard } from './AssetScriptCard';
import { AssetScriptFinal } from './AssetScriptFinal';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: AssetScript,
    card: AssetScriptCard,
    final: AssetScriptFinal,
    ...utils,
};

export default transfer;
