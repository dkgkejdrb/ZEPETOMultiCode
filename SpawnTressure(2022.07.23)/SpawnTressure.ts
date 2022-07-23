import { GameObject } from 'UnityEngine'
import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';

export default class SpawnTressure extends ZepetoScriptBehaviour {

    private cubes: GameObject[] = [];

    private multiplay: ZepetoWorldMultiplay;

    public cubeMaximum: number;

    Start() {
        this.multiplay = GameObject.Find("WorldMultiPlay").GetComponent<ZepetoWorldMultiplay>();

        // cubes �迭 �ʱ�ȭ
        for(let i:number = 0; i < this.cubeMaximum; i++) {
            this.cubes[i] = this.transform.GetChild(i).gameObject;
        }

        // RoomJoined Listener
        this.multiplay.RoomJoined += (room: Room) => {
            room.AddMessageHandler("cubeRandomNumber", (message: number) => {
                
                // cubes ��� ����
                for(let j:number = 0; j < this.cubeMaximum; j++) {
                    this.cubes[j].SetActive(false);
                }
                // ������ ��ȣ�� cube�� ���̱�
                this.cubes[message].SetActive(true);
            });
        }
    }
}