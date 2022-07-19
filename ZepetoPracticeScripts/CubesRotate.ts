import { GameObject, Transform } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class CubesRotate extends ZepetoScriptBehaviour {

    // ���ӿ�����Ʈ ����
    public cube: GameObject;

    // ���ӿ�����Ʈ �迭
    public cubes: GameObject[]

    // ���ӿ�����Ʈ Transform
    public cube_transform: Transform;

    public r_speed: float;

    Start() {
        // "Cube" �±��� ��� ���� ������Ʈ ã��
        /*this.cubes = GameObject.FindGameObjectsWithTag("Cube");*/

        // �ڽ� ������Ʈ ã��
        this.cubes[0] = this.transform.GetChild(0).gameObject;
        this.cubes[1] = this.transform.GetChild(1).gameObject;
        this.cubes[1].SetActive(true);
    }

    Update() {
        this.cubes[0].transform.Rotate(0, this.r_speed, 0);
        this.cubes[1].transform.Rotate(0, this.r_speed, 0);
    }
}