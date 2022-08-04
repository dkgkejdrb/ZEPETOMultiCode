import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Text } from 'UnityEngine.UI';

export default class UI extends ZepetoScriptBehaviour {

    public txt: Text;
    score: number;

    showScore(score: number) {
        this.txt.text = score.toString();
    }
}