import { Manager, materials, colors, Mode } from './manager'
import { pickerMaterial, pickedVoxelID } from './modules/picker'
import { HUD } from "./modules/hud"
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
  // if (highlightedVoxelID != null) {
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
