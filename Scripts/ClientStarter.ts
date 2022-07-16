// ��Ƽ�÷��̿� Room ����Ʈ
import { CharacterState, SpawnInfo, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { Player, State, Vector3 } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
// ��Ƽ�÷��̿� �ʿ��� Ŭ���� ����Ʈ
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import * as UnityEngine from 'UnityEngine';


export default class ClientStarter extends ZepetoScriptBehaviour {
    // ZepetoWorldMultiplay ������ ����
    // ���̾��Ű�� �����ص� WorldMultiPlay ������Ʈ�� ����
    public multiplay: ZepetoWorldMultiplay;

    // RoomCreated() �̺�Ʈ �����ʸ� ���
    private room: Room;

    // ���ӵ� player ������ ���� map������ currentPlayers�� ����
    // key������ player ID�� �����ϱ� ���� string�� value���� Player ��ü�� ����
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    Start() {
        // ���޹��� Room ���ڸ� this.room�� �Ҵ�
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };
        // RoomJoined() �̺�Ʈ �����ʸ� ���
        // �ش� Room�� ���ӵǸ� Room ���ڸ� ����
        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        // StartCoroutine���������� Ŭ���̾�Ʈ�� ��ġ���� ����
        this.StartCoroutine(this.SendMessageLoop(0.1));
    }

    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                // ���� �÷��̾��� �ν��Ͻ� ���翩�θ� �Ǵ� HasPlayer
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                // ���� �÷��̾ �ִٸ� myPlayer�� ���� �÷��̾� �ν��Ͻ��� ����
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // ���� myPlayer�� �����̸�, �� ��ġ ������ ����
                    // SendTransform �Լ��� �����Ͽ� ����
                    if (myPlayer.character.CurrentState != CharacterState.Idle) {
                        this.SendTransform(myPlayer.character.transform);
                    }
                }
            }
        }
    }

    // �� ��ġ ������ �����ϴ� �Լ�
    private SendTransform(transform: UnityEngine.Transform) {
        // transform�� �����ϱ� ���� RoomData ��ü ����
        const data = new RoomData();

        // position�� �־��� RoomData ��ü ����
        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        // rotation�� �־��� RoomData ��ü ����
        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());

        // onChanged Ÿ������ �޼����� ����
        this.room.Send("onChangedTransform", data.GetObject);
    }



    // OnStateChange() �� RoomJoined() �Ǿ��� ��, ó������ true�̰� ���ĺ��ʹ� False�� ����
    private OnStateChange(state: State, isFirst: boolean) {
        // Room�� ó�� �������� ��
        if (isFirst) {
            // ZepetoPlayers�� �ν��Ͻ��� �����Ͽ� AddListner()�� ���
            // �� event�� localplayer �ν��Ͻ��� ���� ������ �ε�Ǿ��� �� ȣ��
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                // ��� myPlayer�� ZepetoPlayers�� �ν��Ͻ��� ����
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                // myPlayer�� ĳ���Ϳ� �����ϸ� OnChangedState.AddListner()�� ȣ��
                // ���� ���°� ����Ǹ� ĳ���� ������Ʈ�� �����ϴ� �Լ�(.SendState()) ȣ��
                myPlayer.character.OnChangedState.AddListener((cur, prev) => {
                    this.SendState(cur);
                })
            });

            // ĳ���� ������ ���۹ޱ� ���� OnAddedPlayer�� ���ο� �����ʸ� �߰�
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                // local player�� �ƴ� ��쿡�� ������Ʈ�ϵ���
                // local player���� �Ǵ��ϴ� isLocal ����� ����
                const isLocal = this.room.SessionId === sessionId;

                // local player�� �ƴ϶��
                if (!isLocal) {
                    // current players�� sessionId�� �ش��ϴ� �÷��̾ �ҷ���
                    const player: Player = this.currentPlayers.get(sessionId);

                    // player�� ��ġ ������ ������Ʈ �ϴ� �Լ� ����
                    player.OnChange += (ChangeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        // join �� �÷��̾ �����ϱ� ���� ���� �����Ͽ� ���ο� ���� join�� �Ҵ�
        let join = new Map<string, Player>();
        // leave �� �÷��̾ �����ϱ� ���� ���� �����Ͽ� ���ο� ���� leave�� �Ҵ�
        let leave = new Map<string, Player>(this.currentPlayers);

        // schema�� ����� room state�� ���� foreach�� �ϳ��� ��ȸ 
        state.players.ForEach((sessionId: string, player: Player) => {
            if (this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            // Room�� �����ϴ� player�� ��� �����ϰ�, ������ player�� leave�� �߰�
            leave.delete(sessionId);
        });

        // room�� �÷��̾ ������ �� event�� ���� �� �ְ� �÷��̾� ��ü�� .OnJoinPlayer()�� ����
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // Room���� ������ ��� player �ν��Ͻ��� �����ϱ� ���� OnLeavePlayer() ȣ��
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }



    // ������ state �����ϱ�
    private SendState(state: CharacterState) {
        // ������ ������ ������ Ÿ�� RoomData
        const data = new RoomData();
        // ���� ĳ���� state�� ����
        data.Add("state", state);
        // ������ �޼����� ����
        this.room.Send("OnChangedState", data.GetObject());
    }


    // Room ���� �� �÷��̾� �̺�Ʈ ó���ϱ�
    private OnJoinPlayer(sessionId: string, player: Player) {
        // join�� �÷��̾��� ������ ���
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);

        // Room�� ������ �÷��̾ �����ϱ� ���� ���� ������  �÷��̾ currentPlayers�� ����
        this.currentPlayers.set(sessionId, player);

        // ������ �÷��̾��� �ʱ� trasnform ������ ���� spawnInfo�� ����
        const spawnInfo = new SpawnInfo();

        // ��ġ��
        const position = new UnityEngine.Vector3(0, 0, 0);

        // ȸ����
        const rotation = new UnityEngine.Vector3(0, 0, 0);

        // ������ �÷��̾��� ��ġ�� ȸ����
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        // �÷��̾� �ν��Ͻ� �����Լ��� ȣ���ϱ� ���� isLocal ����� ����
        // ���� ���� ID�� Player�� ���� ID�� ��ġ�ϸ� Local �÷��̾�� �Ǻ�
        const isLocal = this.room.SessionId === player.sessionId;

        // ZepetoPlayers.instance.CreatePlayerWithUser()�� �÷��̾� �ν��Ͻ��� ����
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }

    
    private OnUpdatePlayer(sessionId: string, player: Player) {
        
        const position = this.ParseVector3(player.transform.position);

        // ��ġ�� ������Ʈ�� player�� �޾ƿ�
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        // MoveToPosition() �Լ��� �÷��̾ �̵�
        zepetoPlayer.character.MoveToPosition(position);

        // �÷��̾� ���°� ������ ���, ���� ���¸� ȣ��
        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }

    // ParseVector3 ���� ���ڷ� ���Ե� Schema Ÿ���� Vector3�� ����Ƽ������ Vector3�� ��ȯ
    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3(
            vector3.x,
            vector3.y,
            vector3.z
        );
    }
}