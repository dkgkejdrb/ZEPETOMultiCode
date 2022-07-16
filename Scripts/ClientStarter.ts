// 멀티플레이에 Room 임포트
import { CharacterState, SpawnInfo, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { Player, State, Vector3 } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
// 멀티플레이에 필요한 클래스 임포트
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import * as UnityEngine from 'UnityEngine';


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

        // StartCoroutine정기적으로 클라이언트의 위치정보 전달
        this.StartCoroutine(this.SendMessageLoop(0.1));
    }

    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                // 로컬 플레이어의 인스턴스 존재여부를 판단 HasPlayer
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                // 로컬 플레이어가 있다면 myPlayer에 로컬 플레이어 인스턴스를 저장
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // 만약 myPlayer가 움직이면, 내 위치 정보를 전송
                    // SendTransform 함수로 정의하여 전송
                    if (myPlayer.character.CurrentState != CharacterState.Idle) {
                        this.SendTransform(myPlayer.character.transform);
                    }
                }
            }
        }
    }

    // 내 위치 정보를 전송하는 함수
    private SendTransform(transform: UnityEngine.Transform) {
        // transform을 전송하기 위해 RoomData 객체 생성
        const data = new RoomData();

        // position을 넣어줄 RoomData 객체 생성
        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        // rotation을 넣어줄 RoomData 객체 생성
        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());

        // onChanged 타입으로 메세지를 전송
        this.room.Send("onChangedTransform", data.GetObject);
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

            // 캐릭터 정보를 전송받기 위해 OnAddedPlayer에 새로운 리스너를 추가
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                // local player가 아닌 경우에만 업데이트하도록
                // local player인지 판단하는 isLocal 상수를 생성
                const isLocal = this.room.SessionId === sessionId;

                // local player가 아니라면
                if (!isLocal) {
                    // current players에 sessionId에 해당하는 플레이어를 불러옴
                    const player: Player = this.currentPlayers.get(sessionId);

                    // player의 위치 정보를 업데이트 하는 함수 선언
                    player.OnChange += (ChangeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        // join 한 플레이어를 관리하기 위해 맵을 생성하여 새로운 변수 join에 할당
        let join = new Map<string, Player>();
        // leave 한 플레이어를 관리하기 위해 맵을 생성하여 새로운 변수 leave에 할당
        let leave = new Map<string, Player>(this.currentPlayers);

        // schema에 저장된 room state의 값을 foreach로 하나씩 조회 
        state.players.ForEach((sessionId: string, player: Player) => {
            if (this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            // Room에 존재하는 player는 모두 제거하고, 퇴장한 player만 leave에 추가
            leave.delete(sessionId);
        });

        // room에 플레이어가 입장할 때 event를 받을 수 있게 플레이어 객체에 .OnJoinPlayer()를 연결
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // Room에서 퇴장한 모든 player 인스턴스를 제거하기 위해 OnLeavePlayer() 호출
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
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

    
    private OnUpdatePlayer(sessionId: string, player: Player) {
        
        const position = this.ParseVector3(player.transform.position);

        // 위치를 업데이트할 player를 받아옴
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        // MoveToPosition() 함수로 플레이어를 이동
        zepetoPlayer.character.MoveToPosition(position);

        // 플레이어 상태가 점프인 경우, 점프 상태를 호출
        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }

    // ParseVector3 에서 인자로 포함된 Schema 타입의 Vector3를 유니티엔진의 Vector3로 변환
    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3(
            vector3.x,
            vector3.y,
            vector3.z
        );
    }
}