import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject } from 'UnityEngine';
import { Text } from 'UnityEngine.UI';

// 참고1 : https://github.com/naverz/zepeto-studio-kor/discussions/215
// 참고2 : https://github.com/naverz/zepeto-studio-kor/discussions/806

export default class StaticUI extends ZepetoScriptBehaviour {

    public txt: Text;

    private static Instance: StaticUI;

    public static GetInstance(): StaticUI {
        // if (!StaticUI.Instance) {

        //     var _obj = new GameObject("CustomSingleton");
        //     GameObject.DontDestroyOnLoad(_obj);
        //     StaticUI.Instance = _obj.AddComponent<StaticUI>();
        // }
        var _obj = new GameObject("CustomSingleton");
        GameObject.DontDestroyOnLoad(_obj);
        StaticUI.Instance = _obj.AddComponent<StaticUI>();
        return StaticUI.Instance;
    }

    showScore(score: string) {
        this.txt.text = score;
    }
}