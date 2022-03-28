import { Manager, materials, colors, Mode } from './manager'
import { pickerMaterial, pickedVoxelID } from './modules/picker'
import { HUD } from './modules/hud'
import * as utils from '@dcl/ecs-scene-utils'
import { getVoxels } from './modules/serverHandler'
import { Voxel, VOXEL_SIZE, voxels, VoxelData } from './modules/voxel'

// import { voxels } from './modules/voxel'

// UI Elements
const canvas = new UICanvas()
const hud = new HUD(canvas)

// Global button events
const input = Input.instance

Object.keys(Mode).length

input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (): void => {
  log('E Key Pressed')
  switch (Manager.activeMode) {
    case Mode.Add:
      Manager.activeMode = Mode.Subtract
      hud.switchModeIcon(Mode.Subtract)
      break
    case Mode.Subtract:
      Manager.activeMode = Mode.EyeDrop
      hud.switchModeIcon(Mode.EyeDrop)
      break
    case Mode.EyeDrop:
      Manager.activeMode = Mode.Add
      hud.switchModeIcon(Mode.Add)
      break
    default:
      break
  }

  log('Active Mode: ', Manager.activeMode)
})

input.subscribe('BUTTON_DOWN', ActionButton.SECONDARY, false, (): void => {
  log('F Key Pressed')
  Manager.setVoxelColor()
  pickerMaterial.albedoColor = colors[Manager.colorIndex]
  log('Color: ', materials[Manager.colorIndex].albedoColor)

  // Delete function
  // if (highlightedVoxelID !== null) {
  //   engine.removeEntity(engine.entities[highlightedVoxelID])
  //   Manager.playSubtractVoxelSound()
  // }

  // Undo function
  // if (voxels.length > 0) {
  //   engine.removeEntity(voxels.pop())
  //   Manager.playSubtractVoxelSound()
  // }

  // Clear function
  // for (let voxel of voxels) {
  //   engine.removeEntity(voxel)
  // }
})

/// update voxels periodically

export const updateHandler = new Entity()
engine.addEntity(updateHandler)

updateHandler.addComponent(
  new utils.Interval(10000, async function () {
    const voxelList: VoxelData[] = await getVoxels()

    for (let i = 0; i < voxelList.length; i++) {
      switch (voxelList[i].mode) {
        case Mode.Add:
          const voxel = new Voxel(
            new BoxShape(),
            new Transform({
              position: new Vector3(
                voxelList[i].x,
                voxelList[i].y,
                voxelList[i].z
              ),
              scale: new Vector3(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE)
            })
          )
          voxels.push(voxel)
          voxel.addComponent(materials[voxelList[i].colIndex])
          break
        case Mode.Subtract:
          const voxelName =
            'x' +
            voxelList[i].x.toString() +
            'y' +
            voxelList[i].y.toString() +
            'z' +
            voxelList[i].z.toString()

          engine.removeEntity(engine.entities[voxelName])
          break
      }
    } //else third mode?????
  })
)
