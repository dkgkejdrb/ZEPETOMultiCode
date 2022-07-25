import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
import { Player, Transform, Vector3 } from "ZEPETO.Multiplay.Schema";

export default class extends Sandbox {
    // deltaTime의 누적합 변수는 반드시 0으로 초기화
    tempTime: number = 0;
    // spawn 시간
    spawnDelayTime: number = 1;
    // Cube의 랜덤 인덱스값(0~3)
    cubeRandomNumber: number = 0;

    onTick(deltaTime: number) {
        this.tempTime += deltaTime;
        
        if (this.tempTime / 1000 > this.spawnDelayTime) {
            this.cubeRandomNumber = Math.floor(Math.random() * 4);
            // client로 Cube의 랜덤 인덱스값 전송
            this.broadcast("cubeRandomNumber", this.cubeRandomNumber);
            this.tempTime = 0;
        }
    }

    // Room이 생성되었을 때
    // Client 코드로부터 수신된 메시지를 확인하기 위해
    onCreate(options: SandboxOptions) {
        this.onMessage("cubeHit", (client: SandboxPlayer, message: number) => {
            
            //this.broadcast("echo", message);
            console.log("Hit");
        });

        this.onMessage("message", (client: SandboxPlayer, message: string) => {
            
            //
            // Triggers when 'message' message is sent.
            //
            this.broadcast("echo", message);
        });

        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
        });

        // 개별 클라이언트들의 위치를 수신받을 수 있도록
        // onChangedTransform 메시지 리스너
        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);

            // 받아온 위치 정보를 받기 위한 transform 객체
            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            // message에서 전달받은 플레이어 위치 정보를 player에 저장
            player.transform = transform;
        });
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





    // Room 퇴장시 클라이언트의 sessionId 삭제
    onLeave(client: SandboxPlayer, consented?: boolean) {
        this.state.players.delete(client.sessionId);
    }
}