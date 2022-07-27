import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { LeaderboardAPI } from 'ZEPETO.Script.Leaderboard';
import { SetScoreResponse } from 'ZEPETO.Script.Leaderboard';

export default class LeaderBoard extends ZepetoScriptBehaviour {

    public leaderboardId: string;
    public score: number;

    // 리더보드 ID와 Score 값, 그리고 완료 시점과 에러 발생 시점의 콜백 함수를 인자로 전달
    Start() {    
        LeaderboardAPI.SetScore(this.leaderboardId, this.score, this.OnResult, this.OnError);
    }

    OnResult(result: SetScoreResponse) {
        console.log(`result.isSuccess: ${result.isSuccess}`);
    }

    OnError(result: string) {
        console.error();
    }
}