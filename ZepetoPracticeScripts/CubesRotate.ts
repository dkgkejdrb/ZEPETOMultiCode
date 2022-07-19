import { GameObject, Transform } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class CubesRotate extends ZepetoScriptBehaviour {

    // 게임오브젝트 변수
    public cube: GameObject;

    // 게임오브젝트 배열
    public cubes: GameObject[]

    // 게임오브젝트 Transform
    public cube_transform: Transform;

    public r_speed: float;

    Start() {
        // "Cube" 태그의 모든 게임 오브젝트 찾기
        /*this.cubes = GameObject.FindGameObjectsWithTag("Cube");*/

        // 자식 오브젝트 찾기
        this.cubes[0] = this.transform.GetChild(0).gameObject;
        this.cubes[1] = this.transform.GetChild(1).gameObject;
        this.cubes[1].SetActive(true);
    }

    Update() {
        this.cubes[0].transform.Rotate(0, this.r_speed, 0);
        this.cubes[1].transform.Rotate(0, this.r_speed, 0);
    }
}