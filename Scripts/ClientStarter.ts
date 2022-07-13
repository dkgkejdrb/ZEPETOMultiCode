// 멀티플레이에 Room 임포트
import { CharacterState, SpawnInfo, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { Player, State } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
// 멀티플레이에 필요한 클래스 임포트
import { ZepetoWorldMultiplay } from 'ZEPETO.World'
import * as UnityEngine from 'UnityEngine'


export default class ClientStarter extends ZepetoScriptBehaviour {
    // ZepetoWorldMultiplay 변수를 선언
    // 하이어라키에 생성해둔 WorldMultiPlay 오브젝트를 참조
    public multiplay: ZepetoWorldMultiplay;

    // RoomCreated() 이벤트 리스너를 등록
    private room: Room;

    // 접속된 player 관리를 위해 map형태의 currentPlayers를 정의
    // key값으로 player ID를 저장하기 위해 string과 value값은 Player 객체로 정의
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    Start() {
        // 전달받은 Room 인자를 this.room에 할당
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };
        // RoomJoined() 이벤트 리스너를 등록
        // 해당 Room에 접속되면 Room 인자를 전달
        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };
    }

    // OnStateChange() 는 RoomJoined() 되었을 때, 처음에만 true이고 이후부터는 False를 유지
    private OnStateChange(state: State, isFirst: boolean) {
        // Room에 처음 접속했을 때
        if (isFirst) {
            // ZepetoPlayers의 인스턴스에 접근하여 AddListner()를 등록
            // 이 event는 localplayer 인스턴스가 씬에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                // 상수 myPlayer에 ZepetoPlayers의 인스턴스를 저장
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                // myPlayer의 캐릭터에 접근하면 OnChangedState.AddListner()를 호출
                // 서버 상태가 변경되면 캐릭터 스테이트를 전송하는 함수(.SendState()) 호출
                myPlayer.character.OnChangedState.AddListener((cur, prev) => {
                    this.SendState(cur);
                })
            });
        }

        // join 한 플레이어를 관리하기 위해 맵을 생성하여 새로운 변수 join에 할당
        let join = new Map<string, Player>();

        // schema에 저장된 room state의 값을 foreach로 하나씩 조회 
        state.players.ForEach((sessionId: string, player: Player) => {
            if (this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
        });

        // room에 플레이어가 입장할 때 event를 받을 수 있게 플레이어 객체에 .OnJoinPlayer()를 연결
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));
    }

    // 서버로 state 전송하기
    private SendState(state: CharacterState) {
        // 서버에 전송할 데이터 타입 RoomData
        const data = new RoomData();
        // 현재 캐릭에 state를 저장
        data.Add("state", state);
        // 서버로 메세지를 전송
        this.room.Send("OnChangedState", data.GetObject());
    }


    // Room 입장 시 플레이어 이벤트 처리하기
    private OnJoinPlayer(sessionId: string, player: Player) {
        // join한 플레이어의 정보를 출력
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);

        // Room에 입장한 플레이어를 관리하기 위해 현재 입장한  플레이어를 currentPlayers로 저장
        this.currentPlayers.set(sessionId, player);

        // 입장한 플레이어의 초기 trasnform 설정을 위해 spawnInfo를 선언
        const spawnInfo = new SpawnInfo();

        // 위치값
        const position = new UnityEngine.Vector3(0, 0, 0);

        // 회전값
        const rotation = new UnityEngine.Vector3(0, 0, 0);

        // 스폰시 플레이어의 위치와 회전값
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        // 플레이어 인스턴스 생성함수를 호출하기 전에 isLocal 상수를 생성
        // 룸의 세션 ID와 Player의 세션 ID가 일치하면 Local 플레이어로 판별
        const isLocal = this.room.SessionId === player.sessionId;

        // ZepetoPlayers.instance.CreatePlayerWithUser()로 플레이어 인스턴스를 생성
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }
}