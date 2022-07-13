using System.Collections;
using System.Collections.Generic;
using UnityEngine;

//MonoBehaviour
public class CubeRotate : MonoBehaviour
{
	class cubeRotate
	{
		Transform obj;
		float speed;

		internal cubeRotate(Transform _obj, float _speed)
		{
			obj = _obj;
			speed = _speed;
		}
		internal void rotate()
		{
			obj.Rotate(speed * Time.deltaTime, 0, 0);
		}
	}

	private void Update()
	{
		cubeRotate obj = new cubeRotate(gameObject.transform, 55.5f);
		obj.rotate();
	}
}
