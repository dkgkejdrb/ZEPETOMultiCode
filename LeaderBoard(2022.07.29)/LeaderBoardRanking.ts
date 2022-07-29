import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { LeaderboardAPI, ResetRule } from 'ZEPETO.Script.Leaderboard';
import { GetRangeRankResponse } from 'ZEPETO.Script.Leaderboard';

export default class LeaderBoardRanking extends ZepetoScriptBehaviour {

    public leaderboardId: string;
    public startRank: number;
    public endRank: number;
    public resetRule: ResetRule;
    public score: number;

    Start() {    
        LeaderboardAPI.SetScore(this.leaderboardId, this.score, this.OnResult, this.OnError);
        LeaderboardAPI.GetRangeRank(this.leaderboardId, this.startRank, this.endRank, this.resetRule, false, this.OnResult, this.OnError);
    }

    OnResult(result: GetRangeRankResponse) {
        console.log(`result.isSuccess: ${result.isSuccess}`);
        if (result.rankInfo.myRank) {
            console.log(`member: ${result.rankInfo.myRank.member}, rank: 
            ${result.rankInfo.myRank.rank}, score: ${result.rankInfo.myRank.score}, name: 
            ${result.rankInfo.myRank.name}`);
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
}