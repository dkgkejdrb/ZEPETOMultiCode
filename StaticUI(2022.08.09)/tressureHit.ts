import { Collider, GameObject, Object } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { LeaderboardAPI, ResetRule, SetScoreResponse } from 'ZEPETO.Script.Leaderboard';
import { GetRangeRankResponse } from 'ZEPETO.Script.Leaderboard';

// UI 스크립트의 함수를 실행하기 위해 클래스를 불러옴
import UI from './UI';

// tressureManager의 leaderboardID를 받아오기 위해 클래스를 불러옴
import tressureManager from './tressureManager';

// localCharacter인지 확인하기 위해 클래스를 불러옴
import { ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import StaticUI from './StaticUI';

export default class tressureHit extends ZepetoScriptBehaviour {
    private leaderboardId: string;
    public startRank: number;
    public endRank: number;
    public resetRule: ResetRule;
    public score: number; // 누적할 점수
    // Max score: 유저의 최고 점수를 기록 > 최고점을 달성해야만 받아올 수 있음
    // Min score: 유저의 최소 점수를 기록
    // Accumulate score: 유저의 점수를 누적 합산 등록 > 누적점수를 고정적으로 받아올 수 있음
    // public txt: Text; // 점수 출력 TEXT 

    private localCharacter: ZepetoCharacter;

    Start() {
        StaticUI.GetInstance().gameObject;

        this.leaderboardId = GameObject.Find("Tressures").GetComponent<tressureManager>().leaderboardId;
        LeaderboardAPI.GetRangeRank(this.leaderboardId, this.startRank, this.endRank, this.resetRule, false, this.OnResult, this.OnError);
        
        // localCharacter 참조
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
    }

    OnTriggerEnter(coll: Collider) {
        // localCharacter 인 경우에만 점수보내기
        if (coll.gameObject == this.localCharacter.gameObject) {
            LeaderboardAPI.SetScore(this.leaderboardId, this.score, this.OnResult, this.OnError);
        }
    }

    // 점수를 보내는데 시간이 발생함
    // Enter < 점수를 보냄
    // Exit < 점수를 받음
    OnTriggerExit(coll: Collider) {
        LeaderboardAPI.GetRangeRank(this.leaderboardId, this.startRank, this.endRank, this.resetRule, false, this.OnResult, this.OnError);
        
    }

    OnResult(result: GetRangeRankResponse) {
        // if (result.rankInfo.myRank) {
        //     console.log(`member: ${result.rankInfo.myRank.member}, rank: 
        //     ${result.rankInfo.myRank.rank}, score: ${result.rankInfo.myRank.score}, name: 
        //     ${result.rankInfo.myRank.name}`);
        // }

        // let msg : string = ``;
        // msg += `${result.rankInfo.myRank.name} / ${result.rankInfo.myRank.score}`;
        // let ui: UI = GameObject.Find("UI").GetComponent<UI>();
        // ui.showScore(msg);

        let msg : string = ``;
        if (result.rankInfo.rankList) {
            for (let i = 0; i < result.rankInfo.rankList.length; ++i) {
                var rank = result.rankInfo.rankList.get_Item(i);
                // console.log(`i: ${i}, member: ${rank.member}, rank: ${rank.rank}, score: ${rank.score}, name: ${result.rankInfo.myRank.name}`);
                
                msg += `i: ${i}, rank: ${rank.rank}, score: ${rank.score}, name: ${rank.name}\n`;                         
                // let ui: UI = GameObject.Find("UI").GetComponent<UI>();
                // ui.showScore(msg);
            }
        }
    }

    OnError(error: string) {
        console.log(error);
    }
}