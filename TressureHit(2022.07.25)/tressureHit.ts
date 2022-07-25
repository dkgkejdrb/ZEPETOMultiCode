import { Collider } from 'UnityEngine';
import { GameObject } from 'UnityEngine';
import { Room } from 'ZEPETO.Multiplay';
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import * as UnityEngine from 'UnityEngine';

export default class tressureHit extends ZepetoScriptBehaviour {

    private multiplay: ZepetoWorldMultiplay;
    private tressureNumber: number = 0;
    private room: Room;

    Start(){
        this.multiplay = GameObject.Find("WorldMultiPlay").GetComponent<ZepetoWorldMultiplay>();
    }

    OnTriggerEnter(coll: Collider){
        this.tressureNumber++;

        // room.send Trigger 안에서 작동 안됨.
        this.multiplay.RoomCreated += (room: Room) => {
            this.room.Send("cubeHit", 1);
        }
        console.log(this.tressureNumber);
        this.gameObject.SetActive(false);
    }
}