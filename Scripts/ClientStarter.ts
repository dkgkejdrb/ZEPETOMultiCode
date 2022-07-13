// ��Ƽ�÷��̿� Room ����Ʈ
import { CharacterState, SpawnInfo, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { Player, State } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
// ��Ƽ�÷��̿� �ʿ��� Ŭ���� ����Ʈ
import { ZepetoWorldMultiplay } from 'ZEPETO.World'
import * as UnityEngine from 'UnityEngine'


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
        }

        // join �� �÷��̾ �����ϱ� ���� ���� �����Ͽ� ���ο� ���� join�� �Ҵ�
        let join = new Map<string, Player>();

        // schema�� ����� room state�� ���� foreach�� �ϳ��� ��ȸ 
        state.players.ForEach((sessionId: string, player: Player) => {
            if (this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
        });

        // room�� �÷��̾ ������ �� event�� ���� �� �ְ� �÷��̾� ��ü�� .OnJoinPlayer()�� ����
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));
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
}