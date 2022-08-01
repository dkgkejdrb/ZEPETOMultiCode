import { Collider } from 'UnityEngine';
import { GameObject } from 'UnityEngine';
import { Room } from 'ZEPETO.Multiplay';
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import * as UnityEngine from 'UnityEngine';
import { LeaderboardAPI, ResetRule } from 'ZEPETO.Script.Leaderboard';
import { GetRangeRankResponse } from 'ZEPETO.Script.Leaderboard';

export default class tressureHit extends ZepetoScriptBehaviour {

    public leaderboardId: string;
    public startRank: number;
    public endRank: number;
    public resetRule: ResetRule;
    score: number;

    Start() {    
        
    }

    OnTriggerEnter(coll: Collider) {
        this.score += 100;
        console.log(this.score);
        LeaderboardAPI.SetScore(this.leaderboardId, this.score, this.OnResult, this.OnError);
        
    }

    // 점수를 보내는데 시간이 발생함
    // Enter < 점수를 보냄
    // Exit < 점수를 받음
    OnTriggerExit(coll: Collider) {
        LeaderboardAPI.GetRangeRank(this.leaderboardId, this.startRank, this.endRank, this.resetRule, false, this.OnResult, this.OnError);
    }

    OnResult(result: GetRangeRankResponse) {
        console.log(`result.isSuccess: ${result.isSuccess}`);
        if (result.rankInfo.myRank) {
            console.log(`member: ${result.rankInfo.myRank.member}, rank: 
            ${result.rankInfo.myRank.rank}, score: ${result.rankInfo.myRank.score}, name: 
            ${result.rankInfo.myRank.name}`);
            this.score = result.rankInfo.myRank.score;
        }

        if (result.rankInfo.rankList) {
            for (let i = 0; i < result.rankInfo.rankList.length; ++i) {
                var rank = result.rankInfo.rankList.get_Item(i);
                console.log(`i: ${i}, member: ${rank.member}, rank: ${rank.rank}, score: ${rank.score}, name: ${result.rankInfo.myRank.name}`);
            }
        }
        
    }

    OnError(error: string) {
        console.log(error);
    }

    // private multiplay: ZepetoWorldMultiplay;
    // private tressureNumber: number = 0;
    // private room: Room;

    // Start(){
    //     this.multiplay = GameObject.Find("WorldMultiPlay").GetComponent<ZepetoWorldMultiplay>();
    // }

    // OnTriggerEnter(coll: Collider){
    //     this.tressureNumber++;

    //     // room.send Trigger 안에서 작동 안됨.
    //     this.multiplay.RoomCreated += (room: Room) => {
    //         this.room.Send("cubeHit", 1);
    //     }
    //     console.log(this.tressureNumber);
    //     this.gameObject.SetActive(false);
    // }


}