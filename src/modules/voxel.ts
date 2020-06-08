import { Manager, Mode, materials, colors } from '../manager'
import { pickedVoxelID, pickerMaterial } from './picker'

export const VOXEL_SIZE = 0.25
export const voxelsGroup: ComponentGroup = engine.getComponentGroup(Transform)
export const voxels: Entity[] = [] // Stores all cubes in the scene

export const sceneMessageBus = new MessageBus()
export let voxelNumbers: number[] = []

export class Voxel extends Entity {
  private shape: BoxShape

  constructor(shape: BoxShape, transform: Transform) {
    super()
    engine.addEntity(this)
    this.addComponent(shape)
    this.addComponent(transform)
    this.shape = shape

    let thisVoxel = this

    this.addComponent(
      new OnPointerDown(
        (e) => {
          let position = thisVoxel.getComponent(Transform).position

          sceneMessageBus.emit('editVoxel', {
            position: position,
            normal: e.hit.normal,
            voxel: thisVoxel.uuid,
          })
        },
        {
          button: ActionButton.POINTER,
          showFeedback: false,
        }
      )
    )
  }

  // Edit a voxel depending on what mode the user is in
  editVoxel(x: number, y: number, z: number) {
    switch (Manager.activeMode) {
      case Mode.Add:
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
        break
      case Mode.Subtract:
        this.subtractVoxel()
        break
      case Mode.EyeDrop:
        this.eyeDropVoxel()
        break
      default:
        break
    }
  }

  // Subtract a voxel from the scene
  subtractVoxel(): void {
    if (pickedVoxelID != null) {
      engine.removeEntity(engine.entities[pickedVoxelID])
      Manager.playSubtractVoxelSound()
    }
  }

  // Eye drop a voxel from the scene
  eyeDropVoxel(): void {
    if (pickedVoxelID != null) {
      let eyeDroppedVoxel = engine.entities[pickedVoxelID]
      for (let i = 0; i < colors.length; i++) {
        Manager.playEyeDropVoxelSound()
        if (colors[i] == eyeDroppedVoxel.getComponent(Material).albedoColor) {
          Manager.colorIndex = i
          pickerMaterial.albedoColor = colors[Manager.colorIndex]
        }
      }
    }
  }
}

sceneMessageBus.on('editVoxel', (e) => {
  engine.entities[e.voxel].editVoxel(
    e.position.x + e.normal.x * VOXEL_SIZE,
    e.position.y + e.normal.y * VOXEL_SIZE,
    e.position.z + e.normal.z * VOXEL_SIZE
  )
  log('editing voxel')
  //voxelNumbers[i] =
  //changeVoxels()
})
