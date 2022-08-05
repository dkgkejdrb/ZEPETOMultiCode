import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Text } from 'UnityEngine.UI';

export default class UI extends ZepetoScriptBehaviour {

    public txt: Text;

    showScore(score: string) {
        this.txt.text = score;
    }
}