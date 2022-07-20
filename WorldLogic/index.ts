import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
// Schema에서 Player 임포트
import { Player } from "ZEPETO.Multiplay.Schema";


export default class extends Sandbox {

    // Room이 생성되었을 때
    // Client 코드로부터 수신된 메시지를 확인하기 위해
    onCreate(options: SandboxOptions) {
        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
        })
    }

    // Player가 Room에 입장했을 때
    async onJoin(client: SandboxPlayer) {
        console.log(`clientID: ${client.userId} / sessionID: ${client.sessionId} / hashCode: ${client.hashCode}`);

        // 플레이어를 const로 생성
        const player = new Player();

        // 세션 ID 받아오기
        player.sessionId = client.sessionId;

        // hashcode 받아오기
        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }

        // user ID 받아오기
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }

        // 플레이어의 DataStorage 받아오기
        const storage: DataStorage = client.loadDataStorage();

        // 클라이언트의 방문횟수를 storage에 저장
        // storage 에서 await 키워드로 VisitCount를 number 명시하기
        let visit_cnt = await storage.get("VisitCount") as number;

        // 방문횟수가 없으면 visit_cnt를 0으로 저장하기
        if (visit_cnt == null) visit_cnt = 0;

        console.log(`[OnJoin] ${player.sessionId}'s visit count : ${visit_cnt}.`);

        // 플레이어의 방문횟수를 갱신하여 sotrage에 저장
        // 방문할 때마다 방문횟수를 갱신할 수 있음
        await storage.set("VisitCount", ++visit_cnt);

        // 지금까지 플레이어의 정보를 저장
        // 플레이어의 고유 정보(sessionID)와 player객체를 Room state에 저장
        this.state.players.set(client.sessionId, player);
    }

    onLeave(client: SandboxPlayer, consented?: boolean) {
        
    }
}