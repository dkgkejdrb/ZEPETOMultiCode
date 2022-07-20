import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
// Schema���� Player ����Ʈ
import { Player } from "ZEPETO.Multiplay.Schema";


export default class extends Sandbox {

    // Room�� �����Ǿ��� ��
    // Client �ڵ�κ��� ���ŵ� �޽����� Ȯ���ϱ� ����
    onCreate(options: SandboxOptions) {
        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
        })
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

    onLeave(client: SandboxPlayer, consented?: boolean) {
        
    }
}