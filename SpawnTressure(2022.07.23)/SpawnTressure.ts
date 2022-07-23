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

        // cubes 배열 초기화
        for(let i:number = 0; i < this.cubeMaximum; i++) {
            this.cubes[i] = this.transform.GetChild(i).gameObject;
        }

        // RoomJoined Listener
        this.multiplay.RoomJoined += (room: Room) => {
            room.AddMessageHandler("cubeRandomNumber", (message: number) => {
                
                // cubes 모두 숨김
                for(let j:number = 0; j < this.cubeMaximum; j++) {
                    this.cubes[j].SetActive(false);
                }
                // 랜덤한 번호의 cube만 보이기
                this.cubes[message].SetActive(true);
            });
        }
    }
}