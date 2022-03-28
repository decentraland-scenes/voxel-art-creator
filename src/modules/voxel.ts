import { Manager, Mode, materials, colors } from '../manager'
import { pickedVoxelID, pickerMaterial } from './picker'
import { changeVoxels } from './serverHandler'

export const VOXEL_SIZE = 0.25
export const voxelsGroup: ComponentGroup = engine.getComponentGroup(Transform)
export const voxels: Entity[] = [] // Stores all cubes in the scene

export const sceneMessageBus = new MessageBus()

export type VoxelData = {
  x: number
  y: number
  z: number
  colIndex: number
  mode: Mode
}

export const voxelData: VoxelData[] = []

export class Voxel extends Entity {
  private shape: BoxShape

  constructor(shape: BoxShape, transform: Transform) {
    const entityName =
      'x' +
      transform.position.x.toString() +
      'y' +
      transform.position.y.toString() +
      'z' +
      transform.position.z.toString()
    super(entityName)

    engine.addEntity(this)
    this.addComponent(shape)
    this.addComponent(transform)
    this.shape = shape

    const thisVoxel = this

    this.addComponent(
      new OnPointerDown(
        (e) => {
          const position = thisVoxel.getComponent(Transform).position

          sceneMessageBus.emit('editVoxel', {
            position: position,
            normal: e.hit.normal,
            voxel: thisVoxel.uuid,
            mode: Manager.activeMode,
            colIndex: Manager.colorIndex,
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
  editVoxel(x: number, y: number, z: number, mode: Mode, color?: number) {
    switch (mode) {
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
        voxel.addComponent(materials[color])
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
    if (pickedVoxelID !== null) {
      engine.removeEntity(engine.entities[pickedVoxelID])
      Manager.playSubtractVoxelSound()
    }
  }

  // Eye drop a voxel from the scene
  eyeDropVoxel(): void {
    if (pickedVoxelID !== null) {
      const eyeDroppedVoxel = engine.entities[pickedVoxelID]
      for (let i = 0; i < colors.length; i++) {
        Manager.playEyeDropVoxelSound()
        if (colors[i] === eyeDroppedVoxel.getComponent(Material).albedoColor) {
          Manager.colorIndex = i
          pickerMaterial.albedoColor = colors[Manager.colorIndex]
        }
      }
    }
  }
}

sceneMessageBus.on('editVoxel', (e) => {
  const x = e.position.x + e.normal.x * VOXEL_SIZE
  const y = e.position.y + e.normal.y * VOXEL_SIZE
  const z = e.position.z + e.normal.z * VOXEL_SIZE
  let voxel = engine.entities[e.voxel] as Voxel
  voxel.editVoxel(x, y, z, e.mode, e.colIndex)
  log('editing voxel')
  voxelData.push({
    x: x,
    y: y,
    z: z,
    mode: e.mode,
    colIndex: e.colIndex,
  })
  changeVoxels().catch((error) => log(error))
})
