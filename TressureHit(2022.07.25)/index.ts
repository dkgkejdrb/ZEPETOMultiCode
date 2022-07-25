import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
import { Player, Transform, Vector3 } from "ZEPETO.Multiplay.Schema";

export default class extends Sandbox {
    // deltaTime�� ������ ������ �ݵ�� 0���� �ʱ�ȭ
    tempTime: number = 0;
    // spawn �ð�
    spawnDelayTime: number = 1;
    // Cube�� ���� �ε�����(0~3)
    cubeRandomNumber: number = 0;

    onTick(deltaTime: number) {
        this.tempTime += deltaTime;
        
        if (this.tempTime / 1000 > this.spawnDelayTime) {
            this.cubeRandomNumber = Math.floor(Math.random() * 4);
            // client�� Cube�� ���� �ε����� ����
            this.broadcast("cubeRandomNumber", this.cubeRandomNumber);
            this.tempTime = 0;
        }
    }

    // Room�� �����Ǿ��� ��
    // Client �ڵ�κ��� ���ŵ� �޽����� Ȯ���ϱ� ����
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

        // ���� Ŭ���̾�Ʈ���� ��ġ�� ���Ź��� �� �ֵ���
        // onChangedTransform �޽��� ������
        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);

            // �޾ƿ� ��ġ ������ �ޱ� ���� transform ��ü
            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            // message���� ���޹��� �÷��̾� ��ġ ������ player�� ����
            player.transform = transform;
        });
    }

    // Player�� Room�� �������� ��
    async onJoin(client: SandboxPlayer) {
        console.log(`clientID: ${client.userId} / sessionID: ${client.sessionId} / hashCode: ${client.hashCode}`);

        // �÷��̾ const�� ����
        const player = new Player();

        // ���� ID �޾ƿ���
        player.sessionId = client.sessionId;

        // hashcode �޾ƿ���
        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }

        // user ID �޾ƿ���
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }

        // �÷��̾��� DataStorage �޾ƿ���
        const storage: DataStorage = client.loadDataStorage();

        // Ŭ���̾�Ʈ�� �湮Ƚ���� storage�� ����
        // storage ���� await Ű����� VisitCount�� number ����ϱ�
        let visit_cnt = await storage.get("VisitCount") as number;

        // �湮Ƚ���� ������ visit_cnt�� 0���� �����ϱ�
        if (visit_cnt == null) visit_cnt = 0;

        console.log(`[OnJoin] ${player.sessionId}'s visit count : ${visit_cnt}.`);

        // �÷��̾��� �湮Ƚ���� �����Ͽ� sotrage�� ����
        // �湮�� ������ �湮Ƚ���� ������ �� ����
        await storage.set("VisitCount", ++visit_cnt);

        // ���ݱ��� �÷��̾��� ������ ����
        // �÷��̾��� ���� ����(sessionID)�� player��ü�� Room state�� ����
        this.state.players.set(client.sessionId, player);
    }





    // Room ����� Ŭ���̾�Ʈ�� sessionId ����
    onLeave(client: SandboxPlayer, consented?: boolean) {
        this.state.players.delete(client.sessionId);
    }
}