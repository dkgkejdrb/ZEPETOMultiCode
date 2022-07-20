import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';

export default class ClientServerTest extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;

    Start() {    
        this.multiplay.RoomJoined += (room: Room) => {

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