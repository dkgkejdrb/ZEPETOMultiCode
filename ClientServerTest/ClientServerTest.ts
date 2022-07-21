import { GameObject } from 'UnityEngine';
import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';

export default class ClientServerTest extends ZepetoScriptBehaviour {

    private multiplay: ZepetoWorldMultiplay;

    Start() {
        this.multiplay = GameObject.Find("WorldMultiPlay").GetComponent<ZepetoWorldMultiplay>();

        // RoomCreated Listener from server 'Oncreated'
        this.multiplay.RoomCreated += (room: Room) => {
            console.log("New World!");
        }

        this.multiplay.RoomJoined += (room: Room) => {
            //// room send 2 times
            //for (let i: number = 1; i < 3; i++) {
            //    room.Send("message", "Nice to meet you");
            //}

            // room send
            room.Send("message", "Nice to meet you");

            // client listener
            room.AddMessageHandler("echo", (message: string) => {
                // print server message
                console.log(message);
            });
        };
    }
}