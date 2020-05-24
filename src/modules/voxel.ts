import { Manager, materials } from '../manager'

export const VOXEL_SIZE = 0.25
export const voxelsGroup: ComponentGroup = engine.getComponentGroup(Transform)
export const voxels: Entity[] = [] // Stores all cubes in the scene

export class Voxel extends Entity {
  private shape: BoxShape

  constructor(shape: BoxShape, transform: Transform) {
    super()
    engine.addEntity(this)
    this.addComponent(shape)
    this.addComponent(transform)
    this.shape = shape

    this.addComponent(
      new OnPointerDown(
        (e) => {
          let position = this.getComponent(Transform).position
          this.addVoxel(
            position.x + e.hit.normal.x * VOXEL_SIZE,
            position.y + e.hit.normal.y * VOXEL_SIZE,
            position.z + e.hit.normal.z * VOXEL_SIZE
          )
        },
        {
          button: ActionButton.POINTER,
          showFeedback: false,
        }
      )
    )
  }

  // Adds a voxel to the scene
  addVoxel(x: number, y: number, z: number) {
    log('Voxel added')
    Manager.playAddVoxelSound()
    const voxel = new Voxel(
      this.shape,
      new Transform({
        position: new Vector3(x, y, z),
        scale: new Vector3(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE),
      })
    )
    voxels.push(voxel)
    voxel.addComponent(materials[Manager.colorIndex])
  }

  // Subtract a voxel from the scene
  subtractVoxel(): void {
  }
}
