import { Collider } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { LeaderboardAPI, ResetRule } from 'ZEPETO.Script.Leaderboard';
import { GetRangeRankResponse } from 'ZEPETO.Script.Leaderboard';

export default class tressureHit extends ZepetoScriptBehaviour {

    public leaderboardId: string;
    public startRank: number;
    public endRank: number;
    public resetRule: ResetRule;
    public score: number; // 누적할 점수
    // Max score: 유저의 최고 점수를 기록 > 최고점을 달성해야만 받아올 수 있음
    // Min score: 유저의 최소 점수를 기록
    // Accumulate score: 유저의 점수를 누적 합산 등록 > 누적점수를 고정적으로 받아올 수 있음
    

    Start() {
        
    }

    OnTriggerEnter(coll: Collider) {
        LeaderboardAPI.SetScore(this.leaderboardId, this.score, this.OnResult, this.OnError);
    }

    // 점수를 보내는데 시간이 발생함
    // Enter < 점수를 보냄
    // Exit < 점수를 받음
    OnTriggerExit(coll: Collider) {
        LeaderboardAPI.GetRangeRank(this.leaderboardId, this.startRank, this.endRank, this.resetRule, false, this.OnResult, this.OnError);
        console.log(this.score);
    }

    OnResult(result: GetRangeRankResponse) {
        if (result.rankInfo.myRank) {
            console.log(`${this.score} / ${result.rankInfo.myRank.score}`);       
            // console.log(`member: ${result.rankInfo.myRank.member}, rank: 
            // ${result.rankInfo.myRank.rank}, score: ${result.rankInfo.myRank.score}, name: 
            // ${result.rankInfo.myRank.name}`);
        }

        // if (result.rankInfo.rankList) {
        //     for (let i = 0; i < result.rankInfo.rankList.length; ++i) {
        //         var rank = result.rankInfo.rankList.get_Item(i);
        //         console.log(`i: ${i}, member: ${rank.member}, rank: ${rank.rank}, score: ${rank.score}, name: ${result.rankInfo.myRank.name}`);
        //     }
        // }
        
    }

    OnError(error: string) {
        console.log(error);
    }
}